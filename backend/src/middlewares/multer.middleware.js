import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Check file types - ADD THIS SECTION FOR 'image' FIELD
    if (file.fieldname === 'image') {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for profile images'), false);
        }
    } else if (file.fieldname === 'photos') {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for photos'), false);
        }
    } else if (file.fieldname === 'documents') {
        // Allow almost all file types for documents, but exclude executables and scripts
        const forbiddenTypes = [
            'application/x-msdownload', // .exe
            'application/x-ms-installer', // .msi
            'application/x-sh', // shell scripts
            'application/x-bat', // batch files
            'application/x-csh', // cshell scripts
            'application/x-apple-diskimage' // .dmg
        ];

        if (forbiddenTypes.includes(file.mimetype)) {
            cb(new Error('Executable files are not allowed for security reasons'), false);
        } else {
            cb(null, true);
        }
    } else {
        cb(new Error(`Unexpected field: ${file.fieldname}`), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB limit
        files: 200 // Maximum 15 files total
    }
});

export default upload;