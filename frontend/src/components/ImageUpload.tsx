import { useState, useRef, type ChangeEvent } from 'react';

interface ImageUploadProps {
  onImagesSelected: (images: Array<{ data: string; mediaType: string }>) => void;
  disabled?: boolean;
}

export default function ImageUpload({ onImagesSelected, disabled }: ImageUploadProps) {
  const [selectedImages, setSelectedImages] = useState<Array<{ data: string; mediaType: string; preview: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imagePromises = Array.from(files).map((file) => {
      return new Promise<{ data: string; mediaType: string; preview: string }>((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
          reject(new Error('ファイルは画像である必要があります'));
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          const base64Data = base64String.split(',')[1];

          resolve({
            data: base64Data,
            mediaType: file.type as string,
            preview: base64String,
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    try {
      const images = await Promise.all(imagePromises);
      setSelectedImages(images);
      onImagesSelected(
        images.map((img) => ({
          data: img.data,
          mediaType: img.mediaType,
        }))
      );
    } catch (error) {
      console.error('画像の読み込みに失敗しました:', error);
      alert('画像の読み込みに失敗しました');
    }
  };

  const clearImages = () => {
    setSelectedImages([]);
    onImagesSelected([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    onImagesSelected(
      newImages.map((img) => ({
        data: img.data,
        mediaType: img.mediaType,
      }))
    );
  };

  return (
    <div className="image-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        disabled={disabled}
        style={{ display: 'none' }}
        id="image-upload-input"
      />
      <label htmlFor="image-upload-input" className={`upload-button ${disabled ? 'disabled' : ''}`}>
        📎 画像を追加
      </label>

      {selectedImages.length > 0 && (
        <div className="selected-images">
          <div className="images-preview">
            {selectedImages.map((img, index) => (
              <div key={index} className="image-preview">
                <img src={img.preview} alt={`Preview ${index + 1}`} />
                <button onClick={() => removeImage(index)} className="remove-image">
                  ×
                </button>
              </div>
            ))}
          </div>
          <button onClick={clearImages} className="clear-images">
            すべて削除
          </button>
        </div>
      )}
    </div>
  );
}
