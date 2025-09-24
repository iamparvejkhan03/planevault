import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { LayoutGrid } from 'lucide-react';
import { about, aboutUs, heroImg } from '../assets';

const ImageLightBox = () => {
    const images = [
        { src: heroImg, alt: 'Main auction item' },
        { src: about, alt: 'Auction item detail' },
        { src: aboutUs, alt: 'Auction context' },
        { src: about, alt: 'Auction context' },
    ];
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mainImage, setMainImage] = useState(images[0].src);

    return (
        <div className="flex flex-col gap-3 md:gap-5">
            <div className="relative">
                <img
                    src={mainImage}
                    alt={images[0].alt}
                    className="block object-cover w-full h-48 md:h-80 lg:h-[450px] rounded-2xl shadow-lg"
                />
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 absolute bottom-3 right-3 md:bottom-5 md:right-5 bg-white py-2 px-3 md:py-3 md:px-5 rounded-md cursor-pointer text-sm md:text-base"
                >
                    <LayoutGrid strokeWidth={1.5} fill="#000" className="w-4 h-4 md:w-5 md:h-5" />
                    <span>See all photos ({images.length})</span>
                </button>
            </div>

            {/* Thumbnail Grid */}
            <div className="hidden md:grid w-full grid-cols-3 gap-3">
                {images.slice(0, 3).map((image, index) => (
                    <img
                        key={index}
                        src={image.src}
                        alt={image.alt}
                        onClick={() => {
                            setMainImage(image.src);
                        }}
                        className={`object-cover h-24 lg:h-36 w-full rounded-xl cursor-pointer hover:opacity-80 transition-opacity ${mainImage === image.src && 'border-2 border-primary'}`}
                    />
                ))}
            </div>

            {/* Lightbox */}
            <Lightbox
                open={isOpen}
                close={() => setIsOpen(false)}
                slides={images}
                index={currentIndex}
                on={{ view: ({ index }) => setCurrentIndex(index) }}
                carousel={{
                    finite: images.length <= 1,
                }}
            />
        </div>
    );
};

export default ImageLightBox;