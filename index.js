const express = require('express')
const ejs = require('ejs')
var _ = require('lodash');

const homeStartingContent = 'Azure Virtual Machines that can be started in a self-service approach.'
const aboutContent = 'Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.'

const app = express()

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use(express.json())

const posts = []

const postObj = {
    title: "postTitle1",
    content: "postContent1"
}
posts.push(postObj)
const postObj2 = {
    title: "postTitle2",
    content: "postContent2"
}
posts.push(postObj2)

//root route method , rendering posts[] on home page
app.get('/', (req, res) => {
  res.render('home',
    {
      homeContent: homeStartingContent,
      posts
    })
})

//about route, with some static contents 
app.get('/about', (req, res) => {
  res.render('about',
    {
      aboutContent
    })
})

// app .listen
app.listen(3000, () => {
  console.log('Server started on port 3000')
})