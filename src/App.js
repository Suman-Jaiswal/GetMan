import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import prettyBytes from 'pretty-bytes';
import { useState, useEffect } from 'react';
import { Form, Button, Tabs, Tab, TabPane, TabContainer } from 'react-bootstrap'
import { EditorState, basicSetup } from "@codemirror/basic-setup";
import { EditorView } from "@codemirror/view";
import { json } from "@codemirror/lang-json";
import Editor from './Editor';
// import setupEditor from './setupEditor'



function App() {
    const [data, setData] = useState('')
    const [resDetails, setResDetails] = useState({})
    const [method, setMethod] = useState('GET')
    const [url, setUrl] = useState('')
    const [click, setClick] = useState(true)

    // useEffect(() => {
   
    //     const basicExtentions = [
    //         basicSetup,
    //         json(),
    //         EditorState.tabSize.of(2)
    //     ]
    //     const reqBody = document.querySelector('[data-json-request-body]')
    //     const requestEditor = new EditorView({
    //         state: EditorState.create({
    //             doc: "{\n\t\n}",
    //             extensions: basicExtentions
    //         }),
    //         parent: reqBody
    //     })
    //     const {requestEditor} = setupEditor()
        
    //     setData(requestEditor.state.doc.toString())
        
        
    // }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        const paramsContainer = document.querySelector('[data-params-container]')
        const headersContainer = document.querySelector('[data-headers-container]')
        const resBody = document.querySelector('[data-body-container]')
        const basicExtentions = [
            basicSetup,
            json(),
            EditorState.tabSize.of(2)
        ]
        axios.interceptors.request.use(request => {
            request.customData = request.customData || {}
            request.customData.startTime = new Date().getTime()
            return request

        })
        function updateEndTime(response) {
            response.customData = response.customData || {}
            response.customData.time = new Date().getTime() - response.config.customData.startTime
            return response
        }
        axios.interceptors.response.use(updateEndTime, e => {
            return Promise.reject(updateEndTime(e.response))
        })
        axios({
            url,
            method,
            data: data.jsObject,
            params: keyValuePairToObjects(paramsContainer),
            headers: keyValuePairToObjects(headersContainer)
        })
            .catch(e => e)
            .then(res => {
                document.querySelector('[data-response-section]').classList.remove('d-none')
                updateResponseDetails(res)
                updateResponseEditor(res.data)
                updateResponseHeaders(res)
                console.log(res)
            })
   
      

        const responseEditor = new EditorView({
            state: EditorState.create({
                doc: "{}",
                extensions: [...basicExtentions, EditorView.editable.of(false)]
            }),
            parent: resBody
        })


        function updateResponseEditor(data) {
            responseEditor.dispatch({
                changes: {
                    from: 0,
                    to: responseEditor.state.doc.length,
                    insert: JSON.stringify(data, null, 2)
                }
            })
        }
    }


    const keyValuePairToObjects = (container) => {
        const pairs = container.querySelectorAll('[data-key-value-pair]')
        return [...pairs].reduce((data, pair) => {
            const key = pair.querySelector('[data-key]').value
            const value = pair.querySelector('[data-value]').value

            if (key === '') return data
            return { ...data, [key]: value }
        }, {})
    }

    const updateResponseDetails = (res) => {
        setResDetails({
            status: res.status,
            text: res.statusText,
            time: res.customData? res.customData.time: 'Error',
            size: prettyBytes(
                res.data?
                JSON.stringify(res.data).length: 0 + res.headers? JSON.stringify(res.headers).length: 0
            )
        })
    }

    const updateResponseHeaders = (res) => {
        const responseHeaderContainer = document.querySelector('[data-res-headers]')
        responseHeaderContainer.innerHTML = ""
        if (res.headers) {
             Object.entries(res.headers).forEach(([key, value]) => {
            const keyElement = document.createElement('div')
            keyElement.textContent = key
            responseHeaderContainer.append(keyElement)
            const valueElement = document.createElement('div')
            valueElement.textContent = value
            responseHeaderContainer.append(valueElement)
        })  
        }
      
    }

    useEffect(() => {
        const paramsContainer = document.querySelector('[data-params-container]')
        const headersContainer = document.querySelector('[data-headers-container]')
        const keyValueTemplate = document.querySelector('[data-key-value-template]')

        document.querySelector('[data-add-params]').addEventListener('click', () => {
            paramsContainer.append(createKeyValuePair())
        })
        document.querySelector('[data-add-headers]').addEventListener('click', () => {
            headersContainer.append(createKeyValuePair())
        })

        paramsContainer.append(createKeyValuePair())
        headersContainer.append(createKeyValuePair())

        function createKeyValuePair() {
            const element = keyValueTemplate.children[0].cloneNode(true)
            element.querySelector('[data-remove-btn]').addEventListener('click', (e) => {
                e.target.closest('[data-key-value-pair]').remove()
            })
            return element
        }

    }, [])

    return (
        <div className="container" >
            <div className="display-6 text-center mt-3"><img src="/favicon.ico" alt="" style={{height: '50px', marginBottom:'8px'}}/> <span>GetMan</span></div>
            <Form data-form onSubmit={handleSubmit}>
                <div className="container mt-4">
                    <div className="row">
                        <div className="col-1 ">
                            <select className="form-select w-auto" aria-label="Default select example" data-method defaultValue='GET'
                                onChange={(e) => {
                                    setMethod(e.target.value)
                                }}
                            >
                                <option value='GET' >GET</option>
                                <option value="POST">POST</option>
                            </select>
                        </div>
                        <div className="col-10">
                            <Form.Control data-url
                                placeholder='Enter request URL'
                                name='input'
                                className='w-100'
                                onChange={(e) => {
                                    setUrl(e.target.value)
                                }}
                            />
                        </div>
                        <div className="col-1">
                            <Button type='submit' className='w-100' onClick={() => setClick(!click)} disabled={url ===''}>
                                Send
                            </Button>
                        </div>
                    </div>
                    <div className="container border-outline mt-4">
                        <TabContainer>
                            <Tabs
                                defaultActiveKey="params"
                                transition={false}
                                id="noanim-tab-example"
                                className="mb-3"
                            >
                                <Tab eventKey="params" title="Params">
                                    <TabPane eventKey='params' id='params' >
                                        <div data-params-container>
                                            <Button data-add-params variant='success' className='outline' size='sm'>Add</Button>
                                        </div>
                                    </TabPane>
                                </Tab>
                                <Tab eventKey="headers" title="Headers">
                                    <TabPane eventKey='headers' id='headers'>
                                        <div data-headers-container>
                                            <Button data-add-headers variant='success' className='outline' size='sm'>Add</Button>
                                        </div>
                                    </TabPane>
                                </Tab>
                                <Tab eventKey="json" title="JSON" >
                                    <TabPane eventKey='json' id='json'>
                                        <div data-json-request-body className='overflow-auto bordered' style={{ maxHeight: '200px', border:'1px solid grey'}} > <Editor setData={setData} /></div>
                                    </TabPane>
                                </Tab>

                            </Tabs>

                        </TabContainer>

                    </div>
                </div>
            </Form>
            <div className="mt-3 p-2 d-none" data-response-section >
                <h6>Response:</h6>
                <div className="d-flex">
                    <div className="me-3">
                        Status: <span>{resDetails.status}</span> <span className='text-success bold' ><strong>{resDetails.text}</strong></span>
                    </div>
                    <div className="me-3">
                        Time: <span>{resDetails.time}</span>ms
                    </div>
                    <div className="me-3">
                        Size: <span >{resDetails.size} </span>
                    </div>
                </div>

                <Tabs
                    defaultActiveKey="body"
                    transition={false}
                    id="noanim-tab-example"
                    className="my-3"
                >
                    <Tab eventKey="body" title="Body">
                        <TabPane eventKey='body' id='body' >
                            <div data-body-container>

                            </div>
                        </TabPane>
                    </Tab>
                    <Tab eventKey="res-headers" title="Headers">
                        <TabPane eventKey='res-headers' id='res-headers'>
                            <div data-res-headers-container>
                                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 2rem' }} data-res-headers ></div>
                            </div>
                        </TabPane>
                    </Tab>
                </Tabs>
            </div>
            <template data-key-value-template >
                <div className="input-group my-2" data-key-value-pair>
                    <input type="text" data-key className='form-control' placeholder='key' />
                    <input type="text" data-value className='form-control' placeholder='value' />
                    <Button variant='danger' className='outline' size='sm' data-remove-btn><FontAwesomeIcon icon={faTrash} /> </Button>
                </div>
            </template>
           
        </div>
    );
}

export default App;
