import { Editor } from "@tinymce/tinymce-react";
import { Controller } from "react-hook-form";

function RTE({ name, control, label, defaultValue }) {
    return (
        <div className='flex flex-col gap-2'>
            <Controller 
                name={name || 'content'} 
                control={control} 
                defaultValue={defaultValue || ""}
                render={({ field: { onChange, value } }) => (
                    <Editor
                        apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                        value={value} // Add this line - this is what you were missing!
                        onEditorChange={onChange}
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
                            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; direction: ltr; text-align: left; }',
                            directionality: 'ltr', // Force left-to-right
                            setup: (editor) => {
                                editor.on('init', () => {
                                    editor.getBody().style.direction = 'ltr';
                                    editor.getBody().style.textAlign = 'left';
                                });
                            }
                        }}
                    />
                )}
            />
        </div>
    );
}

export default RTE;