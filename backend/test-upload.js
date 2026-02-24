const { uploadImage } = require('./utils/uploadUtils');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

async function run() {
    try {
        const fakeImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        const result = await uploadImage(fakeImage, 'test');
        console.log("Upload 1 success:", result);
        
        const arr = [fakeImage, fakeImage];
        const arrResult = await Promise.all(arr.map(img => uploadImage(img, 'test')));
        console.log("Upload array success:", arrResult);
    } catch(e) {
        console.error("Test failed:", e);
    }
}
run();
