import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import mVKMiniAppsScrollHelper from '@vkontakte/mvk-mini-apps-scroll-helper'
import JavascriptTimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import ru from 'javascript-time-ago/locale/ru'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min'
import './fonts/stylesheet.css'
import './index.css'
import bridge from '@vkontakte/vk-bridge';


import App from './App'

// Init VK App
bridge.send('VKWebAppInit', {})
JavascriptTimeAgo.locale(en)
JavascriptTimeAgo.locale(ru)

const root = document.getElementById('root')

mVKMiniAppsScrollHelper(root)

ReactDOM.render((
  <BrowserRouter>
    <App location={window.location} />
  </BrowserRouter>
), root)

// import * as serviceWorker from './serviceWorker';
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
