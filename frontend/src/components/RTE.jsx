import { Editor } from "@tinymce/tinymce-react";
import { Controller } from "react-hook-form";

function RTE({name, control, label, defaultValue}){
    return (
        <div className='flex flex-col gap-2'>
            <Controller name={name || 'content'} control={control} render={({field : {onChange}}) => (
                <Editor
                    apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                    initialValue={defaultValue || ""}
                    onEditorChange={onChange}
                    id="content"
                    init={{
                    height: 500,
                    menubar: false,
                    plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | blocks | ' +
                        'bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | help',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                    }}
                />
            )}
            
            />
        </div>
    );
}

export default RTE;