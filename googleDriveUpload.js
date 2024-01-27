/**
 * Insert new file.
 * @return{obj} file Id
 * */
async function uploadBasic(name,mimeType) {
    const fs = require('fs');
    const {GoogleAuth} = require('google-auth-library');
    const {google} = require('googleapis');
  
    // Get credentials and build service
    // TODO (developer) - Use appropriate auth mechanism for your app
    const auth = new GoogleAuth({
        keyFilename: './key/key.json',
        scopes: 'https://www.googleapis.com/auth/drive',
    });
    const service = google.drive({version: 'v3', auth});
    const requestBody = {
      name: name,
      fields: 'id',
    };
    const media = {
      mimeType: mimeType,
      body: fs.createReadStream('files/photo.jpg'),
    };
    try {
      const file = await service.files.create({
        requestBody,
        media: media,
      });
      console.log('File Id:', file.data.id);
      return file.data.id;
    } catch (err) {
      // TODO(developer) - Handle error
      throw err;
    }
}
