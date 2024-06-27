const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs').promises;
require('dotenv').config();

const client = new Client();

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.initialize();

const path = './gen_images/output.jpg';

client.on('message_create', async message => {
    console.log('New message received', message.body);
	if (message.body.startsWith('!generate')) {
		const args = message.body.slice(10).trim();
		try{
			const imageBlob = await query({
				inputs: args,
			});
			saveImageBlobAsJPG(imageBlob, path).then(async () => {
				console.log(`Image saved as ${path}`);
				const media = MessageMedia.fromFilePath(path);
				await message.reply(media).then(() => {
					console.log('Image sent!');
					// fs.unlink(path, (err) => {
					// 	if (err) {
					// 		console.error('Error deleting image:', err);
					// 		message.reply('An error occurred while deleting the image. Please try again later.');
					// 	} else {
					// 		console.log(`Image deleted: ${path}`);
					// 		message.reply('Image deleted successfully.');
					// 	}
					// });
				}).catch((error) => {
					console.error('Error sending image:', error);
					message.reply('An error occurred while sending the image. Please try again later.');
				});
			}).catch((error) => {
				console.error('Error saving image:', error);
				message.reply('An error occurred while processing the image. Please try again later.');
			});
			

		} catch(e){
			console.log(e);
			message.reply(e.message || 'An error occurred while processing the image. Please try again later.');
		}
	}
});

async function saveImageBlobAsJPG(blob, filePath) {
    // Convert Blob to ArrayBuffer
    const arrayBuffer = await blob.arrayBuffer();
    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(arrayBuffer);
    // Save the Buffer as a .jpg file
    await fs.writeFile(filePath, buffer);
}

async function query(data) {
    const response = await fetch(
        process.env.HUGGING_FACE_API_URL,
        {
            headers: { Authorization: `Bearer ${process.env.HUGGING_FACE_BEARER_TOKEN}` },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.blob();
    return result;
}
