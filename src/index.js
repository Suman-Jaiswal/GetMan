import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios'

axios.interceptors.request.use(request => {
    request.customData = {}
    request.customData.startTime = new Date().getTime()
    return request

})
function updateEndTime(response) {
    response.customData = {}
    response.customData.time = new Date().getTime() - response.config.customData.startTime
    return response
}
axios.interceptors.response.use(updateEndTime, e => {
    return Promise.reject(updateEndTime(e.response))
})

ReactDOM.render(

    <App />
    ,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
