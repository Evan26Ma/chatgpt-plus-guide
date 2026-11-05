import importlib.util
from io import BytesIO
import json
from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace
import unittest
import uuid

spec=importlib.util.spec_from_file_location('suggestions',Path(__file__).with_name('server.py'))
app=importlib.util.module_from_spec(spec)
spec.loader.exec_module(app)


def payload(**changes):
    value={'request_id':str(uuid.uuid4()),'category':'improve','tutorial':'15-roogoo-card','title':'','message':'开卡后余额刷新这一步，希望增加完成后的检查截图。','website':''}
    return dict(value,**changes)


class Tests(unittest.TestCase):
    def test_content_validation(self):
        self.assertEqual(app.validate(payload())[1],'improve')
        self.assertEqual(app.validate(payload(tutorial='29-pixel-ai-pro'))[2],'29-pixel-ai-pro')
        self.assertEqual(app.validate(payload(category='new',title='整理对话记录'))[1],'new')
        for invalid in [[],payload(category='other'),payload(tutorial='unknown'),payload(message='太短'),payload(category='new',title=''),payload(website='bot'),payload(request_id='bad'),payload(message='a'*1501)]:
            with self.assertRaises(app.Rejected):app.validate(invalid)
        for keyword in ['VPN','vpn','机场','翻墙','梯子','科学上网','搭建代理']:
            with self.assertRaises(app.Rejected) as caught:app.validate(payload(message='希望新增'+keyword+'的完整使用教程和配置说明'))
            self.assertEqual(caught.exception.status,422)

    def test_private_storage_idempotency_and_rate_limit(self):
        with TemporaryDirectory(dir='F:/AI/tmp') as directory:
            store=app.Store(directory)
            value=app.validate(payload())
            reference,created=store.submit(value,'203.0.113.2',now=100000)
            self.assertTrue(created)
            self.assertEqual(store.submit(value,'203.0.113.2',now=100001),(reference,False))
            for i in range(4):store.submit(app.validate(payload()),'203.0.113.2',now=100002+i)
            with self.assertRaises(app.Rejected) as caught:store.submit(app.validate(payload()),'203.0.113.2',now=100010)
            self.assertEqual(caught.exception.status,429)
            store.submit(app.validate(payload()),'203.0.113.3',now=100010)
            store.submit(app.validate(payload()),'203.0.113.2',now=103611)
            with store.connect() as connection:
                self.assertEqual(connection.execute('SELECT COUNT(*) FROM suggestions').fetchone()[0],7)
                self.assertNotIn('203.0.113.2',repr(connection.execute('SELECT * FROM attempts').fetchall()))
                message=connection.execute('SELECT message FROM suggestions WHERE request_id=?',(value[0],)).fetchone()[0]
                self.assertIn('检查截图',message)

    def test_http_origin_limits_and_no_public_read(self):
        with TemporaryDirectory(dir='F:/AI/tmp') as directory:
            store=app.Store(directory)
            def request(value,extra=None):
                data=json.dumps(value).encode('utf-8')
                headers={'Origin':app.ORIGIN,'Content-Type':'application/json','X-Requested-With':'PlusGuideSuggestions','Content-Length':str(len(data))}
                headers.update(extra or {})
                responses=[]
                handler=SimpleNamespace(path='/api/suggestions',headers=headers,rfile=BytesIO(data),server=SimpleNamespace(store=store),client_address=('127.0.0.1',1234),reply=lambda status,body:responses.append((status,body)))
                app.Handler.do_POST(handler)
                return responses[0]
            body=payload()
            code,result=request(body)
            self.assertEqual(code,201)
            self.assertTrue(result['reference'].startswith('SUG-'))
            self.assertEqual(request(body)[0],200)
            self.assertEqual(request(payload(),{'Origin':'https://other.example'})[0],403)
            self.assertEqual(request(payload(),{'Content-Type':'text/plain'})[0],415)
            self.assertEqual(request(payload(message='x'*9000))[0],413)
            self.assertEqual(request(payload(message='想了解VPN配置的完整教学步骤'))[0],422)
            responses=[]
            handler=SimpleNamespace(path='/api/suggestions',reply=lambda status,body:responses.append((status,body)))
            app.Handler.do_GET(handler)
            self.assertEqual(responses[-1][0],405)
            handler.path='/health'
            app.Handler.do_GET(handler)
            self.assertEqual(responses[-1],(200,{'ok':True}))


if __name__=='__main__':unittest.main(verbosity=2)
