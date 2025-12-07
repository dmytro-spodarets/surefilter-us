'use client';

import { useState } from 'react';
import Image from 'next/image';

interface MediaItem {
  assetId: string;
  isPrimary: boolean;
  position: number;
  caption?: string;
}

interface MediaAsset {
  id: string;
  s3Path: string;
  cdnUrl: string;
  filename: string;
}

interface MediaSectionProps {
  mediaItems: MediaItem[];
  onChange: (mediaItems: MediaItem[]) => void;
  onOpenPicker: () => void;
}

export default function MediaSection({
  mediaItems,
  onChange,
  onOpenPicker,
}: MediaSectionProps) {
  
  const removeMedia = (index: number) => {
    onChange(mediaItems.filter((_, i) => i !== index));
  };

  const setPrimaryMedia = (index: number) => {
    onChange(
      mediaItems.map((m, i) => ({
        ...m,
        isPrimary: i === index,
      }))
    );
  };

  const updateCaption = (index: number, caption: string) => {
    const updated = [...mediaItems];
    updated[index] = { ...updated[index], caption };
    onChange(updated);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...mediaItems];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    // Update positions
    updated.forEach((item, i) => {
      item.position = i;
    });
    onChange(updated);
  };

  const moveDown = (index: number) => {
    if (index === mediaItems.length - 1) return;
    const updated = [...mediaItems];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    // Update positions
    updated.forEach((item, i) => {
      item.position = i;
    });
    onChange(updated);
  };

  const getCdnUrl = (assetId: string) => {
    // In real implementation, you would fetch the asset details
    // For now, return a placeholder
    const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || '';
    return `${cdnUrl}/placeholder-${assetId}.jpg`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Product Images</h2>
          <p className="text-sm text-gray-500 mt-1">Upload and manage product images</p>
        </div>
        <button
          type="button"
          onClick={onOpenPicker}
          className="px-3 py-1.5 text-sm bg-sure-blue-600 text-white rounded-md hover:bg-sure-blue-700"
        >
          + Add Image
        </button>
      </div>

      {mediaItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mediaItems.map((item, index) => (
            <div
              key={index}
              className={`relative border-2 rounded-lg overflow-hidden ${
                item.isPrimary ? 'border-sure-blue-500' : 'border-gray-200'
              }`}
            >
              {/* Image Preview */}
              <div className="relative aspect-video bg-gray-100">
                <Image
                  src={getCdnUrl(item.assetId)}
                  alt={item.caption || `Product image ${index + 1}`}
                  fill
                  className="object-contain p-2"
                />
                
                {/* Primary Badge */}
                {item.isPrimary && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-sure-blue-600 text-white text-xs font-medium rounded">
                    Primary
                  </div>
                )}

                {/* Position Badge */}
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs font-medium rounded">
                  #{index + 1}
                </div>
              </div>

              {/* Caption */}
              <div className="p-3 bg-gray-50">
                <input
                  type="text"
                  value={item.caption || ''}
                  onChange={(e) => updateCaption(index, e.target.value)}
                  placeholder="Image caption (optional)"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-sure-blue-500 focus:border-sure-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="p-3 bg-white border-t border-gray-200 flex items-center justify-between">
                {/* Reorder Buttons */}
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === mediaItems.length - 1}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Primary & Delete */}
                <div className="flex gap-2">
                  {!item.isPrimary && (
                    <button
                      type="button"
                      onClick={() => setPrimaryMedia(index)}
                      className="text-xs text-sure-blue-600 hover:text-sure-blue-800 font-medium"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No images added</p>
          <button
            type="button"
            onClick={onOpenPicker}
            className="mt-3 text-sm text-sure-blue-600 hover:text-sure-blue-800 font-medium"
          >
            Add your first image
          </button>
        </div>
      )}

      <p className="mt-3 text-xs text-gray-500">
        Tip: The first image or the one marked as "Primary" will be used as the main product image
      </p>
    </div>
  );
}
