export async function imageToBase64(imageSource) {
  // Si c'est déjà du base64 (commence par data:image)
  if (typeof imageSource === 'string' && imageSource.startsWith('data:image')) {
    return imageSource;
  }

  // Si c'est un objet File ou Blob (cas classique du navigateur)
  if (imageSource instanceof Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(imageSource);
    });
  }

  // Si c'est un chemin Capacitor (webPath)
  if (typeof imageSource === 'string') {
    try {
      const response = await fetch(imageSource);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("Erreur lors de la conversion du webPath en base64", e);
      throw new Error("Impossible de lire l'image sélectionnée.");
    }
  }

  throw new Error("Format d'image non supporté.");
}
