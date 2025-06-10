export function getImageUrl(product) {
  const imageUrl = product?.image_url?.trim();

  if (imageUrl) {
    return imageUrl;
  }

  return "https://placehold.co/400x300?text=Sem+Imagem";
  
  
}
