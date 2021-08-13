import React from 'react'
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';


export default function Editor({view, height, placeHolder, setData}) {

    return (
        <div>
            <JSONInput
                id='a_unique_id'
                viewOnly={view}
                placeholder= {placeHolder === '' ? null : placeHolder}
                locale={locale}
                height={height}
                width='100%'
                colors={{default: '#1E1E1E'}}
                onChange={setData}
                waitAfterKeyPress={1000}
                theme={'light_mitsuketa_tribute'}
                style = {{
                    contentBox: {
                        color: 'black'
                    }
               }}
            />
        </div>
    )
}

