import React, { useState } from 'hono/jsx';

type ResumePhotoProps = {
  name: string;
  objectKey?: string;
  alt?: string;
};

const buildResumeAssetPath = (objectKey: string) =>
  `/api/resume-assets/${objectKey
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')}`;

export default function ResumePhoto({ alt, name, objectKey }: ResumePhotoProps) {
  const [hasError, setHasError] = useState(false);

  if (!objectKey || hasError) {
    return (
      <div class='w-full h-full flex items-center justify-center text-center text-sm leading-6 text-white'>
        <div>
          証明写真
          <br />
          未設定
        </div>
      </div>
    );
  }

  return (
    <img
      alt={alt || `${name}の履歴書写真`}
      class='w-full h-full object-cover'
      draggable='false'
      onError={() => {
        setHasError(true);
      }}
      src={buildResumeAssetPath(objectKey)}
    />
  );
}
