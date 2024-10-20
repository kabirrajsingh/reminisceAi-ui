export const uploadImage = async (uri: string) => {
    const formData = new FormData();
    formData.append('image', {
      uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });
  
    try {
      const response = await fetch('YOUR_SERVER_URL', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };
  