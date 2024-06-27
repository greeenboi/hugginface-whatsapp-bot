const fs = require('fs').promises;

async function query(data) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/greenarcade/dreambooth-ishanroy",
		{
			headers: { Authorization: "Bearer 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" },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.blob();
	return result;
}

async function saveImageBlobAsJPG(blob, filePath) {
    // Convert Blob to ArrayBuffer
    const arrayBuffer = await blob.arrayBuffer();
    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(arrayBuffer);
    // Save the Buffer as a .jpg file
    await fs.writeFile(filePath, buffer);
}

const main = async () => {
    const imageBlob = await query({
        inputs: "ishanroy with his dog on a walk",
    });
    saveImageBlobAsJPG(imageBlob, 'output.jpg').then(() => {
        console.log('Image saved as output.jpg');
    }).catch((error) => {
        console.error('Error saving image:', error);
    });
};

main();