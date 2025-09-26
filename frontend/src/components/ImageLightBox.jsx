import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';

const ImageLightBox = ({ images = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mainImage, setMainImage] = useState(images[0]?.url || '');

    const openLightbox = (index = 0) => {
        setCurrentIndex(index);
        setMainImage(images[index]?.url || '');
        setIsOpen(true);
    };

    const closeLightbox = () => {
        setIsOpen(false);
    };

    const nextImage = () => {
        const nextIndex = (currentIndex + 1) % images.length;
        setCurrentIndex(nextIndex);
        setMainImage(images[nextIndex]?.url || '');
    };

    const prevImage = () => {
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        setCurrentIndex(prevIndex);
        setMainImage(images[prevIndex]?.url || '');
    };

    if (images.length === 0) {
        return (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">No images available</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 md:gap-5">
            {/* Main Image Section */}
            <div className="relative">
                <img
                    src={mainImage}
                    alt={`Auction image ${currentIndex + 1}`}
                    className="block object-cover w-full h-48 md:h-80 lg:h-[450px] rounded-2xl shadow-lg cursor-pointer"
                    onClick={() => openLightbox(0)}
                />
                <button
                    onClick={() => openLightbox(0)}
                    className="flex items-center gap-2 absolute bottom-3 right-3 md:bottom-5 md:right-5 bg-white py-2 px-3 md:py-3 md:px-5 rounded-md cursor-pointer text-sm md:text-base shadow-lg hover:bg-gray-50 transition-colors"
                >
                    <LayoutGrid strokeWidth={1.5} className="w-4 h-4 md:w-5 md:h-5" />
                    <span>See all photos ({images.length})</span>
                </button>
            </div>

            {/* Thumbnail Grid */}
            {images.length > 1 && (
                <div className="hidden md:grid w-full grid-cols-3 gap-3">
                    {images.slice(0, 2).map((image, index) => (
                        <img
                            loading='lazy'
                            key={index}
                            src={image.url}
                            alt={`Thumbnail ${index + 1}`}
                            onClick={() => {
                                setMainImage(image.url);
                                setCurrentIndex(index);
                            }}
                            className={`object-cover h-24 lg:h-36 w-full rounded-xl cursor-pointer hover:opacity-80 transition-opacity ${
                                mainImage === image.url ? 'border-2 border-primary shadow-md' : ''
                            }`}
                        />
                    ))}
                    {images.length > 3 && (
                        <div 
                            className="relative cursor-pointer group"
                            onClick={() => openLightbox(3)}
                        >
                            <img
                                loading='lazy'
                                src={images[3].url}
                                alt="More photos"
                                className="object-cover h-24 lg:h-36 w-full rounded-xl opacity-80"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                                <span className="text-white font-semibold">+{images.length - 3} more</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Custom Lightbox Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
                    {/* Close Button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-10"
                    >
                        <X size={32} />
                    </button>

                    {/* Navigation Buttons */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-6 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-2"
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-6 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-2"
                            >
                                <ChevronRight size={32} />
                            </button>
                        </>
                    )}

                    {/* Main Image */}
                    <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
                        <img
                            src={mainImage}
                            alt={`Auction image ${currentIndex + 1}`}
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />
                    </div>

                    {/* Image Counter */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full">
                        {currentIndex + 1} / {images.length}
                    </div>

                    {/* Thumbnail Strip */}
                    {images.length > 1 && (
                        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 py-2">
                            {images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image.url}
                                    alt={`Thumb ${index + 1}`}
                                    onClick={() => {
                                        setCurrentIndex(index);
                                        setMainImage(image.url);
                                    }}
                                    className={`w-16 h-16 object-cover rounded cursor-pointer border-2 transition-all ${
                                        currentIndex === index 
                                            ? 'border-white border-3' 
                                            : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Keyboard Navigation */}
                    <div className="absolute opacity-0">
                        {/* Hidden element for keyboard navigation description */}
                        Use arrow keys to navigate images
                    </div>
                </div>
            )}

            {/* Keyboard Event Handler */}
            {isOpen && (
                <div 
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowRight') nextImage();
                        if (e.key === 'ArrowLeft') prevImage();
                        if (e.key === 'Escape') closeLightbox();
                    }}
                    className="outline-none"
                />
            )}
        </div>
    );
};

export default ImageLightBox;