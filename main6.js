const express = require('express')
const app = express()
const fs = require('fs')
const port = 3000
const template = require('./lib/template.js')
// const template={
//     HTML:function(name,list,body){
//         return `
//         <!DOCTYPE html>
//     <html lang="en">
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <meta http-equiv="X-UA-Compatible" content="ie=edge">
//         <title>${name}</title>
//     </head>
//     <body>
//         <h1><a href ="/">선린인터넷고등학교</a></h1>
//         <!-- 메뉴 -->
//         ${list}
//         ${body}
//     </body>
//     </html>
//         `
//     }, list:function(files){
//         let list='<ol>'
//         for(i=0;i<files.length;i++){
//             list= list + `<li><a href="?name=${files[i]}">${files[i]}</a></li>`
//         }
//         list = list + '</ol>'
//     return list
//     }
//     // 함수를 객체화 시키기
// }

app.get('/',(req,res)=>{
    // const q= req.query
    // const name=q.name
    // 위에와 아래는 같음
    let {name} = req.query
    fs.readdir('page',(err,files)=>{
        let list= template.list(files)

        fs.readFile(`page/${name}`,'utf8',(err,data)=>{
            let control = `<a href="/create">create</a> <a href="/update?name=${name}">update</a>
            <form action="delete_process" method="post">
                <input type="hidden" name="id" value="${name}">
                <button type="submit">delete</button>
            </form>
            `
            if(name === undefined){
                name='오늘 할일을 입력하세요'
                data = `공부해라 이자식아!`
                control=`<a href="/create">create</a>`
            }
            const html = template.HTML(name,list,`<h2>${name}</h2><p>${data}</p>`,control)
            // 바디의 내용을 templateHTML함수로 전달하여 코드를 깔끔하게 만들기
        res.send(html)
        })
    })    
})
app.get('/create',(req,res)=>{
    fs.readdir('page',(err,files)=>{
        const name = 'create'
        const list = template.list(files)
        const data = template.create()
        const html = template.HTML(name,list,data,'')
        res.send(html)
    })
})
app.get('/update',(req,res)=>{
    let {name} = req.query
    fs.readdir('page',(err,files)=>{
        let list= template.list(files)

        fs.readFile(`page/${name}`,'utf8',(err,content)=>{
            let control = `<a href="/create">create</a><a href="/update?name=${name}"> update</a>
            <form action="delete_process" method="post">
                <input type="hidden" name="id" value="${name}">
                <button type="submit">delete</button>
            </form>
            `
            const data=template.update(name,content) // 위와 이름이 같아야함 ( content content or data data)
            const html = template.HTML(name,list,`<h2>${name} 페이지</h2><p>${data}</p>`,control)
            // 바디의 내용을 templateHTML함수로 전달하여 코드를 깔끔하게 만들기
        res.send(html)
        })
    })    
})
const qs=require('querystring')
app.post('/create_process',(req,res)=>{
    let body = ''
    req.on('data',(data)=>{
        body=body + data
    })
    req.on('end',()=>{
        const post = qs.parse(body)
        const title = post.title
        const description = post.description
        fs.writeFile(`page/${title}`,description,'utf8',(eff)=>{
            res.redirect(302, `/?name=${title}`) //처리후 다른 페이지ㅣ 이동하기
            
        })
    })
})
app.post('/update_process',(req,res)=>{
    let body = ''
    req.on('data',(data)=>{
        body=body + data
    })
    req.on('end',()=>{
        const post = qs.parse(body)
        const id = post.id
        const title=post.title
        const description = post.description
        fs.rename(`page/${id}`,`page/${title}`,(err)=>{
            fs.writeFile(`page/${title}`,description,'utf8',(err)=>{
                res.redirect(302, `/?name=${title}`) //처리후 다른 페이지ㅣ 이동하기
            })
        })
       
    })
})
app.post('/delete_process',(req,res)=>{
    let body = ''
    req.on('data',(data)=>{
        body=body + data
    })
    req.on('end',()=>{
        const post = qs.parse(body)
        const id = post.id
        fs.unlink(`page/${id}`,(err)=>{
            res.redirect(302, `/`) //처리후 다른 페이지ㅣ 이동하기
            
        })
    })
})
app.listen(port,()=>{
    console.log(`server running on port ${port}`)
})

