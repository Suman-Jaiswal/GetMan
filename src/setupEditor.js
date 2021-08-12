import { EditorState, basicSetup } from "@codemirror/basic-setup";
import { EditorView } from "@codemirror/view";
import { json } from "@codemirror/lang-json";

export default function setupEditors() {
    
    const reqBody = document.querySelector('[data-json-request-body]')
    const basicExtentions = [
        basicSetup,
        json(),
        EditorState.tabSize.of(2)
    ]

    const requestEditor = new EditorView({
        state: EditorState.create({
            doc: "{\n\t\n}",
            extensions: basicExtentions
        }),
        parent: reqBody
    })

    return { requestEditor }
}