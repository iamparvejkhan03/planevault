import { useState } from 'react';
import { useForm } from 'react-hook-form';
import parse from 'html-react-parser';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
    FileText,
    DollarSign,
    Settings,
    CheckCircle,
    ArrowLeft,
    ArrowRight,
    X,
    Image,
    File,
    Clock,
    MapPin,
    Gavel,
    Youtube,
    Plane,
    Cog,
    Trophy,
    Move // Add this icon
} from "lucide-react";
import { RTE, SellerContainer, SellerHeader, SellerSidebar } from '../../components';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance.js';
import { useNavigate } from 'react-router-dom';

// Drag and Drop item types
const ItemTypes = {
    PHOTO: 'photo',
};

// Draggable Photo Component
const DraggablePhoto = ({ photo, index, movePhoto, removePhoto }) => {
    const [, ref] = useDrag({
        type: ItemTypes.PHOTO,
        item: { index },
    });

    const [, drop] = useDrop({
        accept: ItemTypes.PHOTO,
        hover: (draggedItem) => {
            if (draggedItem.index !== index) {
                movePhoto(draggedItem.index, index);
                draggedItem.index = index;
            }
        },
    });

    return (
        <div ref={(node) => ref(drop(node))} className="relative group">
            <img
                src={URL.createObjectURL(photo)}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg cursor-move"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                <Move size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                {index + 1}
            </div>
            <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
                <X size={14} />
            </button>
        </div>
    );
};

// Photo Gallery Component
const PhotoGallery = ({ photos, movePhoto, removePhoto }) => {
    return (
        <div className="mt-4">
            <p className="text-sm text-secondary mb-3">
                Drag and drop to reorder photos. The first image will be the main thumbnail.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {photos.map((photo, index) => (
                    <DraggablePhoto
                        key={`photo-${index}`}
                        photo={photo}
                        index={index}
                        movePhoto={movePhoto}
                        removePhoto={removePhoto}
                    />
                ))}
            </div>
        </div>
    );
};

// components/UploadProgressModal.jsx
const UploadProgressModal = ({ isOpen, fileCount }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                <div className="flex items-center mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mr-3"></div>
                    <h3 className="text-lg font-semibold">Creating Your Auction</h3>
                </div>

                <div className="space-y-3">
                    <p className="text-gray-600">
                        We're uploading {fileCount} file(s) to our secure cloud storage.
                    </p>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                            ⏳ <strong>Please be patient:</strong> Large files may take several minutes to upload depending on your internet speed.
                        </p>
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                        Do not close this window until the process is complete.
                    </p>
                </div>
            </div>
        </div>
    );
};

const categoryFields = {
    'Aircraft': [
        { name: 'make', label: 'Make', type: 'text', required: true, placeholder: 'e.g., Cessna, Piper, Boeing' },
        { name: 'model', label: 'Model', type: 'text', required: true, placeholder: 'e.g., 172, PA-28, 737' },
        { name: 'year', label: 'Year', type: 'number', required: true, min: 1900, max: 2025 },
        { name: 'registration', label: 'Registration', type: 'text', required: true, placeholder: 'e.g., N12345' },
        { name: 'totalTime', label: 'Total Time', type: 'number', required: true, min: 0 },
        { name: 'engineTimeSMOH', label: 'Engine Time SMOH', type: 'number', required: false, min: 0 },
        { name: 'lastAnnualDate', label: 'Last Annual Inspection Date', type: 'date', required: false },
        { name: 'usefulLoad', label: 'Useful Load (lbs)', type: 'number', required: false, min: 0 },
        { name: 'fuelType', label: 'Fuel Type', type: 'select', required: true, options: ['Avgas', 'Jet A', 'Diesel', 'Electric'] },
        { name: 'seatingCapacity', label: 'Seating Capacity', type: 'number', required: true, min: 1, max: 1000 },
        { name: 'maxTakeoffWeight', label: 'Max Takeoff Weight (lbs)', type: 'number', required: false, min: 0 },
        { name: 'engineType', label: 'Engine Type', type: 'select', required: true, options: ['Piston', 'Turboprop', 'Jet', 'Turbofan'] },
        { name: 'engineCount', label: 'Number of Engines', type: 'number', required: true, min: 1, max: 10 },
        { name: 'aircraftCondition', label: 'Condition', type: 'select', required: true, options: ['Excellent', 'Good', 'Fair', 'Project'] },

        // Conditional fields based on engine type
        { name: 'propellerTime', label: 'Propeller Total Time', type: 'number', required: false, min: 0, condition: { engineType: 'Piston' } },
        { name: 'propellerModel', label: 'Propeller Model', type: 'text', required: false, placeholder: 'e.g., McCauley 1A170', condition: { engineType: 'Piston' } },
        { name: 'engineTotalCycles', label: 'Engine Total Cycles', type: 'number', required: false, min: 0, condition: { engineType: 'Jet' } },
        { name: 'tbo', label: 'Time Between Overhaul (TBO)', type: 'number', required: false, min: 0, condition: { engineType: 'Turboprop' } },
    ],
    'Engines & Parts': [
        { name: 'partType', label: 'Part Type', type: 'select', required: true, options: ['Engine', 'Propeller', 'Avionics', 'Airframe', 'Interior', 'Other'] },
        { name: 'partNumber', label: 'Part Number', type: 'text', required: true, placeholder: 'Manufacturer part number' },
        { name: 'manufacturer', label: 'Manufacturer', type: 'text', required: true, placeholder: 'e.g., Lycoming, Garmin, Honeywell' },
        { name: 'condition', label: 'Condition', type: 'select', required: true, options: ['New', 'Overhauled', 'Used Serviceable', 'As-Removed'] },
        { name: 'hoursSinceNew', label: 'Hours Since New/Overhaul', type: 'number', required: false, min: 0 },
        { name: 'serialNumber', label: 'Serial Number', type: 'text', required: false },
    ],
    'Memorabilia': [
        { name: 'itemType', label: 'Item Type', type: 'select', required: true, options: ['Uniform', 'Document', 'Model', 'Photograph', 'Instrument', 'Other'] },
        { name: 'era', label: 'Historical Era', type: 'select', required: true, options: ['WWI', 'WWII', 'Cold War', 'Modern', 'Vintage'] },
        { name: 'authenticity', label: 'Authenticity', type: 'select', required: true, options: ['Certified', 'Documented', 'Unknown'] },
        { name: 'year', label: 'Year', type: 'number', required: false, min: 1800, max: 2025 },
        { name: 'dimensions', label: 'Dimensions', type: 'text', required: false, placeholder: 'e.g., 24x36 inches' },
        { name: 'material', label: 'Material', type: 'text', required: false, placeholder: 'e.g., Brass, Wood, Fabric' }
    ]
};

const CreateAuction = () => {
    const [step, setStep] = useState(1);
    const [uploadedPhotos, setUploadedPhotos] = useState([]);
    const [uploadedDocuments, setUploadedDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        setError,
        clearErrors,
        trigger,
        getValues,
        reset,
        control,
        formState: { errors }
    } = useForm({
        mode: 'onChange'
    });

    const auctionType = watch('auctionType');
    const selectedCategory = watch('category');

    // Move photo function for drag and drop
    const movePhoto = (fromIndex, toIndex) => {
        const updatedPhotos = [...uploadedPhotos];
        const [movedPhoto] = updatedPhotos.splice(fromIndex, 1);
        updatedPhotos.splice(toIndex, 0, movedPhoto);
        setUploadedPhotos(updatedPhotos);
    };

    // Get category-specific fields
    const getCategoryFields = () => {
        return categoryFields[selectedCategory] || [];
    };

    const categories = [
        'Aircraft',
        'Engines & Parts',
        'Memorabilia'
    ];

    const categoryIcons = {
        'Aircraft': Plane,
        'Engines & Parts': Cog,
        'Memorabilia': Trophy
    };

    // Render category-specific fields (keep your existing implementation)
    const renderCategoryFields = () => {
        const fields = getCategoryFields();

        // Filter fields based on conditions (engine type for aircraft)
        const filteredFields = fields.filter(field => {
            if (!field.condition) return true;

            // For aircraft fields with engine type conditions
            if (field.condition.engineType) {
                const engineTypeValue = watch('specifications.engineType');
                return engineTypeValue === field.condition.engineType;
            }

            return true;
        });

        return (
            <div className="mb-6">
                <label className="text-sm font-medium text-secondary mb-4 flex items-center">
                    {(() => {
                        const IconComponent = categoryIcons[selectedCategory] || FileText;
                        return <IconComponent size={20} className="mr-2" />;
                    })()}
                    {selectedCategory} Specifications *
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredFields.map((field) => (
                        <div key={field.name} className="space-y-2">
                            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>

                            {field.type === 'select' ? (
                                <select
                                    {...register(`specifications.${field.name}`, {
                                        required: field.required ? `${field.label} is required` : false
                                    })}
                                    id={field.name}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                >
                                    <option value="">Select {field.label}</option>
                                    {field.options.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            ) : field.type === 'textarea' ? (
                                <textarea
                                    {...register(`specifications.${field.name}`, {
                                        required: field.required ? `${field.label} is required` : false
                                    })}
                                    id={field.name}
                                    rows={3}
                                    placeholder={field.placeholder}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                            ) : field.type === 'date' ? (
                                <input
                                    {...register(`specifications.${field.name}`, {
                                        required: field.required ? `${field.label} is required` : false
                                    })}
                                    id={field.name}
                                    type="date"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                            ) : (
                                <input
                                    {...register(`specifications.${field.name}`, {
                                        required: field.required ? `${field.label} is required` : false,
                                        min: field.min ? { value: field.min, message: `Must be at least ${field.min}` } : undefined,
                                        max: field.max ? { value: field.max, message: `Must be at most ${field.max}` } : undefined
                                    })}
                                    id={field.name}
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    min={field.min}
                                    max={field.max}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                            )}

                            {errors.specifications?.[field.name] && (
                                <p className="text-red-500 text-sm">{errors.specifications[field.name].message}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const nextStep = async () => {
        // Validate current step before proceeding
        let isValid = true;

        if (step === 1) {
            // Trigger validation for all fields
            const fieldsToValidate = ['title', 'category', 'description'];

            // Add category-specific fields to validation
            if (selectedCategory) {
                const categoryFields = getCategoryFields();
                categoryFields.forEach(field => {
                    if (field.required) {
                        fieldsToValidate.push(`specifications.${field.name}`);
                    }
                });
            }

            const overallValidationPassed = await trigger(fieldsToValidate);

            // If overall validation failed, don't proceed
            if (!overallValidationPassed) {
                isValid = false;
            }

            // Check photos are uploaded
            if (uploadedPhotos.length === 0) {
                setError('photos', {
                    type: 'manual',
                    message: 'At least one photo is required'
                });
                isValid = false;
            } else {
                clearErrors('photos');
            }
        }

        if (step === 2) {
            // Check pricing fields
            const fieldsToValidate = ['startPrice', 'bidIncrement', 'auctionType'];
            if (watch('auctionType') === 'reserve') {
                fieldsToValidate.push('reservePrice');
            }

            const overallValidationPassed = await trigger(fieldsToValidate);

            // If overall validation failed, don't proceed
            if (!overallValidationPassed) {
                isValid = false;
            }
        }

        if (!isValid) {
            return;
        }

        setStep(step + 1);
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files);
        // Add new photos to the beginning of the array so they appear first
        setUploadedPhotos([...files, ...uploadedPhotos]);
        clearErrors('photos');
    };

    const handleDocumentUpload = (e) => {
        const files = Array.from(e.target.files);
        setUploadedDocuments([...uploadedDocuments, ...files]);
    };

    const removePhoto = (index) => {
        const newPhotos = uploadedPhotos.filter((_, i) => i !== index);
        setUploadedPhotos(newPhotos);

        if (newPhotos.length === 0) {
            setError('photos', {
                type: 'manual',
                message: 'At least one photo is required'
            });
        } else {
            clearErrors('photos');
        }
    };

    const removeDocument = (index) => {
        setUploadedDocuments(uploadedDocuments.filter((_, i) => i !== index));
    };

    const createAuctionHandler = async (auctionData) => {
        try {
            setIsLoading(true);
            const accessToken = localStorage.getItem('accessToken');

            // Create FormData object for file uploads
            const formData = new FormData();

            // Append all text fields
            formData.append('title', auctionData.title);
            formData.append('category', auctionData.category);
            formData.append('description', auctionData.description);
            formData.append('location', auctionData.location || '');
            formData.append('videoLink', auctionData.video || '');
            formData.append('startPrice', auctionData.startPrice);
            formData.append('bidIncrement', auctionData.bidIncrement);
            formData.append('auctionType', auctionData.auctionType);

            // Append specifications as JSON
            if (auctionData.specifications) {
                formData.append('specifications', JSON.stringify(auctionData.specifications));
            }

            // Append reserve price if applicable
            if (auctionData.auctionType === 'reserve' && auctionData.reservePrice) {
                formData.append('reservePrice', auctionData.reservePrice);
            }

            // Append photos as files (in the order they appear in the array)
            uploadedPhotos.forEach((photo, index) => {
                formData.append('photos', photo); // This should be the actual File object
            });

            // Append documents as files
            uploadedDocuments.forEach((doc, index) => {
                formData.append('documents', doc); // This should be the actual File object
            });

            const { data } = await axiosInstance.post(
                '/api/v1/auctions/create',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            if (data && data.success) {
                toast.success(data.message);
                setStep(1);
                setUploadedPhotos([]);
                setUploadedDocuments([]);
                reset();
                navigate('/seller/auctions/all');
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to create auction';
            toast.error(errorMessage);
            console.log('Create auction error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <section className="flex min-h-[70vh]">
                <SellerSidebar />
                <UploadProgressModal
                    isOpen={isLoading}
                    fileCount={uploadedPhotos.length + uploadedDocuments.length}
                />

                <div className="w-full relative">
                    <SellerHeader />

                    <SellerContainer>
                        <div className="pt-16 md:py-7">
                            <h1 className="text-3xl md:text-4xl font-bold mb-5">Create Auction</h1>
                            <p className="text-secondary mb-8">List your item for bidding on our platform</p>

                            {/* Progress Steps */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    {['Auction Info', 'Pricing & Bidding', 'Review & Submit'].map((label, index) => (
                                        <div key={index} className="flex flex-col items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step > index + 1 ? 'bg-green-500 text-white' :
                                                step === index + 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                {step > index + 1 ? <CheckCircle size={20} /> : index + 1}
                                            </div>
                                            <span className="text-sm mt-2 hidden md:block">{label}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="w-full bg-gray-200 h-3 rounded-full">
                                    <div
                                        className="bg-black h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${(step / 3) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit(createAuctionHandler)} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                                {/* Step 1: Auction Information */}
                                {step === 1 && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                                            <FileText size={20} className="mr-2" />
                                            Auction Details
                                        </h2>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <label htmlFor="title" className="block text-sm font-medium text-secondary mb-1">Item Name *</label>
                                                <input
                                                    {...register('title', { required: 'Item name is required' })}
                                                    id="title"
                                                    type="text"
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                    placeholder="e.g., 2017 VANS RV-6A"
                                                />
                                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="category" className="block text-sm font-medium text-secondary mb-1">Category *</label>
                                                <select
                                                    {...register('category', { required: 'Category is required' })}
                                                    id="category"
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                >
                                                    <option value="">Select a category</option>
                                                    {categories.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                                            </div>
                                        </div>

                                        {/* Category-specific fields */}
                                        {selectedCategory && renderCategoryFields()}

                                        <div className="mb-6">
                                            <label htmlFor="description" className="block text-sm font-medium text-secondary mb-1">Description *</label>
                                            <RTE
                                                name="description"
                                                control={control}
                                                label="Description:"
                                                defaultValue={getValues('description') || ''}
                                            />
                                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <label htmlFor="location" className="block text-sm font-medium text-secondary mb-1">Location</label>
                                                <div className="relative">
                                                    <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        {...register('location')}
                                                        id="location"
                                                        type="text"
                                                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                        placeholder="e.g., Dallas, Texas"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="video" className="block text-sm font-medium text-secondary mb-1">Video Link</label>
                                                <div className="relative">
                                                    <Youtube size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        {...register('video', {
                                                            pattern: {
                                                                value: /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/,
                                                                message: 'Please enter a valid YouTube URL'
                                                            }
                                                        })}
                                                        id="video"
                                                        type="url"
                                                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                        placeholder="YouTube video URL"
                                                    />
                                                </div>
                                                {errors.video && <p className="text-red-500 text-sm mt-1">{errors.video.message}</p>}
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <label htmlFor="photo-upload" className="block text-sm font-medium text-secondary mb-1">Attach Photos *</label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handlePhotoUpload}
                                                    className="hidden"
                                                    id="photo-upload"
                                                />
                                                <label htmlFor="photo-upload" className="cursor-pointer">
                                                    <Image size={40} className="mx-auto text-gray-400 mb-2" />
                                                    <p className="text-gray-600">Browse photo(s) to upload</p>
                                                    <p className="text-sm text-secondary">Recommended: at least 40 high-quality photos</p>
                                                </label>
                                            </div>
                                            {errors.photos && <p className="text-red-500 text-sm mt-1">{errors.photos.message}</p>}

                                            {uploadedPhotos.length > 0 && (
                                                <PhotoGallery
                                                    photos={uploadedPhotos}
                                                    movePhoto={movePhoto}
                                                    removePhoto={removePhoto}
                                                />
                                            )}
                                        </div>

                                        <div className="mb-6">
                                            <label htmlFor="document-upload" className="block text-sm font-medium text-secondary mb-1">Attach Documents</label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={handleDocumentUpload}
                                                    className="hidden"
                                                    id="document-upload"
                                                />
                                                <label htmlFor="document-upload" className="cursor-pointer">
                                                    <File size={40} className="mx-auto text-gray-400 mb-2" />
                                                    <p className="text-gray-600">Browse document(s) to upload</p>
                                                    <p className="text-sm text-secondary">logbooks, maintenance records, ownership docs, etc.</p>
                                                </label>
                                            </div>

                                            {uploadedDocuments.length > 0 && (
                                                <div className="mt-4 space-y-2">
                                                    {uploadedDocuments.map((doc, index) => (
                                                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                                            <span className="text-sm truncate">{doc.name}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeDocument(index)}
                                                                className="text-red-500"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Pricing & Bidding */}
                                {step === 2 && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                                            <DollarSign size={20} className="mr-2" />
                                            Pricing & Bidding
                                        </h2>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <label htmlFor="startPrice" className="block text-sm font-medium text-secondary mb-1">Start Price *</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">$</span>
                                                    <input
                                                        {...register('startPrice', {
                                                            required: 'Start price is required',
                                                            min: { value: 0, message: 'Price must be positive' }
                                                        })}
                                                        id="startPrice"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        className="w-full pl-8 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                {errors.startPrice && <p className="text-red-500 text-sm mt-1">{errors.startPrice.message}</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="bidIncrement" className="block text-sm font-medium text-secondary mb-1">Bid Increment *</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">$</span>
                                                    <input
                                                        {...register('bidIncrement', {
                                                            required: 'Bid increment is required',
                                                            min: { value: 0, message: 'Increment must be positive' }
                                                        })}
                                                        id="bidIncrement"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        className="w-full pl-8 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                {errors.bidIncrement && <p className="text-red-500 text-sm mt-1">{errors.bidIncrement.message}</p>}
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-secondary mb-1">Auction Type *</label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {[
                                                    { value: 'standard', label: 'Standard Auction' },
                                                    { value: 'reserve', label: 'Reserve Price Auction' },
                                                ].map((type) => (
                                                    <label key={type.value} className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                                        <input
                                                            type="radio"
                                                            {...register('auctionType', { required: 'Auction type is required' })}
                                                            value={type.value}
                                                            className="mr-3"
                                                        />
                                                        <span>{type.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            {errors.auctionType && <p className="text-red-500 text-sm mt-1">{errors.auctionType.message}</p>}
                                        </div>

                                        {auctionType === 'reserve' && (
                                            <div className="mb-6">
                                                <label htmlFor="reservePrice" className="block text-sm font-medium text-secondary mb-1">Reserve Price *</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">$</span>
                                                    <input
                                                        {...register('reservePrice', {
                                                            required: auctionType === 'reserve' ? 'Reserve price is required' : false,
                                                            min: { value: 0, message: 'Price must be positive' },
                                                            validate: value => {
                                                                const startPrice = parseFloat(watch('startPrice') || 0);
                                                                const reservePrice = parseFloat(value);
                                                                return reservePrice >= startPrice || 'Reserve price must be greater than or equal to start price';
                                                            }
                                                        })}
                                                        id="reservePrice"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        className="w-full pl-8 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                {errors.reservePrice && <p className="text-red-500 text-sm mt-1">{errors.reservePrice.message}</p>}
                                                <p className="text-sm text-secondary mt-1">Item will not sell if bids don't reach this price</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Step 3: Review & Submit */}
                                {step === 3 && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                                            <Settings size={20} className="mr-2" />
                                            Review & Submit
                                        </h2>

                                        <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
                                            <h3 className="font-medium text-lg mb-4 border-b pb-2">Auction Summary</h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Item Details */}
                                                <div className="space-y-4">
                                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                                        <h4 className="font-medium mb-3">Item Details</h4>
                                                        <div className="space-y-2">
                                                            <div>
                                                                <p className="text-xs text-secondary">Item Name</p>
                                                                <p className="font-medium">{watch('title') || 'Not provided'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-secondary">Category</p>
                                                                <p className="font-medium">{watch('category') || 'Not provided'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-secondary">Location</p>
                                                                <p className="font-medium">{watch('location') || 'Not specified'}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {selectedCategory && (
                                                        <div className="bg-white p-4 rounded-lg shadow-sm">
                                                            <h4 className="font-medium mb-3">{selectedCategory} Specifications</h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {getCategoryFields().map((field) => {
                                                                    const value = watch(`specifications.${field.name}`);
                                                                    return value ? (
                                                                        <div key={field.name}>
                                                                            <p className="text-xs text-secondary">{field.label}</p>
                                                                            <p className="font-medium">{value}</p>
                                                                        </div>
                                                                    ) : null;
                                                                }).filter(Boolean)}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Pricing */}
                                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                                        <h4 className="font-medium mb-3">Pricing</h4>
                                                        <div className="space-y-2">
                                                            <div>
                                                                <p className="text-xs text-secondary">Start Price</p>
                                                                <p className="font-medium">${watch('startPrice') || '0.00'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-secondary">Bid Increment</p>
                                                                <p className="font-medium">${watch('bidIncrement') || '0.00'}</p>
                                                            </div>
                                                            {watch('auctionType') === 'reserve' && (
                                                                <div>
                                                                    <p className="text-xs text-secondary">Reserve Price</p>
                                                                    <p className="font-medium text-green-600">${watch('reservePrice') || '0.00'}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Auction Details */}
                                                <div className="space-y-4">
                                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                                        <h4 className="font-medium mb-3">Auction Details</h4>
                                                        <div className="space-y-2">
                                                            <div>
                                                                <p className="text-xs text-secondary">Auction Type</p>
                                                                <p className="font-medium">
                                                                    {watch('auctionType') === 'standard' && 'Standard Auction'}
                                                                    {watch('auctionType') === 'reserve' && 'Reserve Price Auction'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Media */}
                                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                                        <h4 className="font-medium mb-3">Media & Documents</h4>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <p className="text-xs text-secondary">Photos</p>
                                                                <span className="font-medium bg-gray-100 px-2 py-1 rounded-full text-xs">
                                                                    {uploadedPhotos.length} uploaded
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <p className="text-xs text-secondary">Documents</p>
                                                                <span className="font-medium bg-gray-100 px-2 py-1 rounded-full text-xs">
                                                                    {uploadedDocuments.length} uploaded
                                                                </span>
                                                            </div>
                                                            {watch('video') && (
                                                                <div className="flex justify-between items-center">
                                                                    <p className="text-xs text-secondary">Video</p>
                                                                    <span className="font-medium bg-gray-100 px-2 py-1 rounded-full text-xs">
                                                                        Included
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Description Preview */}
                                            <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
                                                <h4 className="font-medium text-black mb-3">Description Preview</h4>
                                                <div className="prose prose-lg max-w-none border rounded-lg p-4 bg-gray-50">
                                                    {watch('description') ? (
                                                        parse(watch('description'))
                                                    ) : (
                                                        <p className="text-gray-500 italic">No description provided</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <label htmlFor="termsAgreed" className="flex items-start">
                                                <input
                                                    type="checkbox"
                                                    {...register('termsAgreed', { required: 'You must agree to the terms' })}
                                                    id="termsAgreed"
                                                    className="mt-1 mr-2"
                                                />
                                                <span className="text-sm font-medium text-secondary">
                                                    I agree to the terms and conditions and confirm that I have the right to sell this item
                                                </span>
                                            </label>
                                            {errors.termsAgreed && <p className="text-red-500 text-sm mt-1">{errors.termsAgreed.message}</p>}
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex justify-between mt-8">
                                    {step > 1 ? (
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="flex items-center px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            <ArrowLeft size={18} className="mr-2" />
                                            Previous
                                        </button>
                                    ) : (
                                        <div></div>
                                    )}

                                    {step < 3 ? (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault(); // Prevent default form submission
                                                nextStep();
                                            }}
                                            className="flex items-center px-6 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors"
                                        >
                                            Next
                                            <ArrowRight size={18} className="ml-2" />
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            className="flex items-center px-6 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors"
                                        >
                                            <Gavel size={18} className="mr-2" />
                                            {isLoading ? 'Creating Auction...' : 'Create Auction'}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </SellerContainer>
                </div>
            </section>
        </DndProvider>
    );
};

export default CreateAuction;