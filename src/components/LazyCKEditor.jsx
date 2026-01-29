import { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';

// Lazy load CKEditor - only loads when this component is rendered
const CKEditor = lazy(() => import('@ckeditor/ckeditor5-react').then(mod => ({ default: mod.CKEditor })));
const ClassicEditor = lazy(() => import('@ckeditor/ckeditor5-build-classic'));

/**
 * Lazy-loaded CKEditor wrapper
 * This ensures CKEditor (1.32 MB) is only loaded on pages that need it
 */
export default function LazyCKEditor({ data, onChange, placeholder = 'Start typing...', disabled = false }) {
    return (
        <Suspense fallback={
            <div className="w-full min-h-[200px] border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading editor...</p>
                </div>
            </div>
        }>
            <CKEditor
                editor={ClassicEditor}
                data={data}
                onChange={(event, editor) => {
                    const content = editor.getData();
                    onChange(content);
                }}
                config={{
                    placeholder,
                    toolbar: [
                        'heading', '|',
                        'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|',
                        'blockQuote', 'insertTable', '|',
                        'undo', 'redo'
                    ],
                }}
                disabled={disabled}
            />
        </Suspense>
    );
}

LazyCKEditor.propTypes = {
    data: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
};
