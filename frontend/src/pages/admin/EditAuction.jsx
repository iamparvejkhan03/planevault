import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import parse from 'html-react-parser';
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
} from "lucide-react";
import { RTE, AdminContainer, AdminHeader, AdminSidebar } from '../../components';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';

// Use the same categoryFields configuration from your seller edit page
const categoryFields = {
    'Aircraft': [
        { name: 'make', label: 'Make', type: 'text', required: true, placeholder: 'e.g., Cessna, Piper, Boeing' },
        { name: 'model', label: 'Model', type: 'text', required: true, placeholder: 'e.g., 172, PA-28, 737' },
        { name: 'year', label: 'Year', type: 'number', required: true, min: 1900, max: 2025 },
        { name: 'registration', label: 'Registration', type: 'text', required: true, placeholder: 'e.g., N12345' },
        { name: 'totalHours', label: 'Total Hours', type: 'number', required: true, min: 0 },
        { name: 'fuelType', label: 'Fuel Type', type: 'select', required: true, options: ['Avgas', 'Jet A', 'Diesel', 'Electric'] },
        { name: 'seatingCapacity', label: 'Seating Capacity', type: 'number', required: true, min: 1, max: 1000 },
        { name: 'maxTakeoffWeight', label: 'Max Takeoff Weight (lbs)', type: 'number', required: false, min: 0 },
        { name: 'engineType', label: 'Engine Type', type: 'select', required: true, options: ['Piston', 'Turboprop', 'Jet', 'Turbofan'] },
        { name: 'engineCount', label: 'Number of Engines', type: 'number', required: true, min: 1, max: 10 },
        { name: 'aircraftCondition', label: 'Condition', type: 'select', required: true, options: ['Excellent', 'Good', 'Fair', 'Project'] }
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

const EditAuction = () => {
    const [step, setStep] = useState(1);
    const [uploadedPhotos, setUploadedPhotos] = useState([]);
    const [uploadedDocuments, setUploadedDocuments] = useState([]);
    const [existingPhotos, setExistingPhotos] = useState([]);
    const [existingDocuments, setExistingDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialSpecifications, setInitialSpecifications] = useState({});
    const [removedPhotos, setRemovedPhotos] = useState([]);
    const [removedDocuments, setRemovedDocuments] = useState([]);

    const { auctionId } = useParams();
    const navigate = useNavigate();

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

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        setError,
        clearErrors,
        trigger,
        getValues,
        control,
        reset,
        formState: { errors }
    } = useForm({
        mode: 'onChange'
    });

    const auctionType = watch('auctionType');
    const startDate = watch('startDate');
    const endDate = watch('endDate');
    const selectedCategory = watch('category');

    // Use the same helper functions from your seller edit page
    const getCategoryFields = () => {
        return categoryFields[selectedCategory] || [];
    };

    const renderCategoryFields = () => {
        const fields = getCategoryFields();

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
                    {fields.map((field) => {
                        const fieldName = `specifications.${field.name}`;
                        const fieldValue = watch(fieldName) || ''; // Get current value

                        return (
                            <div key={field.name} className="space-y-2">
                                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>

                                {field.type === 'select' ? (
                                    <select
                                        id={field.name}
                                        value={fieldValue}
                                        onChange={(e) => {
                                            const newValue = e.target.value;
                                            setValue(fieldName, newValue, {
                                                shouldValidate: true,
                                                shouldDirty: true
                                            });
                                        }}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                    >
                                        <option value="">Select {field.label}</option>
                                        {field.options.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                ) : field.type === 'textarea' ? (
                                    <textarea
                                        id={field.name}
                                        value={fieldValue}
                                        onChange={(e) => {
                                            const newValue = e.target.value;
                                            console.log(`Changing ${fieldName} from ${fieldValue} to ${newValue}`);
                                            setValue(fieldName, newValue, {
                                                shouldValidate: true,
                                                shouldDirty: true
                                            });
                                        }}
                                        rows={3}
                                        placeholder={field.placeholder}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                    />
                                ) : (
                                    <input
                                        id={field.name}
                                        type={field.type}
                                        value={fieldValue}
                                        onChange={(e) => {
                                            const newValue = e.target.value;
                                            setValue(fieldName, newValue, {
                                                shouldValidate: true,
                                                shouldDirty: true
                                            });
                                        }}
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
                        );
                    })}
                </div>
            </div>
        );
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        return localDate.toISOString().slice(0, 16);
    };

    const mapToObject = (map) => {
        if (!map) return {};
        if (map instanceof Map) {
            const obj = {};
            map.forEach((value, key) => {
                obj[key] = value;
            });
            return obj;
        }
        return map;
    };

    // Fetch auction data
    useEffect(() => {
        const fetchAuctionData = async () => {
            try {
                setIsLoading(true);
                const { data } = await axiosInstance.get(`/api/v1/admin/auctions/${auctionId}`);

                if (data.success) {
                    const auction = data.data.auction;
                    const specificationsObj = mapToObject(auction.specifications);
                    setInitialSpecifications(specificationsObj);

                    // Set basic fields
                    const formData = {
                        title: auction.title,
                        category: auction.category,
                        description: auction.description,
                        location: auction.location,
                        video: auction.videoLink,
                        startDate: formatDateForInput(auction.startDate),
                        endDate: formatDateForInput(auction.endDate),
                        startPrice: auction.startPrice,
                        bidIncrement: auction.bidIncrement,
                        auctionType: auction.auctionType,
                        reservePrice: auction.reservePrice,
                    };

                    reset(formData);

                    setTimeout(() => {
                        Object.entries(specificationsObj).forEach(([key, value]) => {
                            setValue(`specifications.${key}`, value, {
                                shouldValidate: true,
                                shouldDirty: false,
                                shouldTouch: false
                            });
                        });
                    }, 100);

                    setExistingPhotos(auction.photos || []);
                    setExistingDocuments(auction.documents || []);

                    toast.success('Auction data loaded successfully');
                }
            } catch (error) {
                console.error('Error:', error);
                toast.error('Failed to load auction data');
                navigate('/admin/auctions');
            } finally {
                setIsLoading(false);
            }
        };

        if (auctionId) fetchAuctionData();
    }, [auctionId, reset, setValue, navigate]);

    const nextStep = async () => {
        let isValid = true;

        if (step === 1) {
            const fieldsToValidate = ['title', 'category', 'description', 'startDate', 'endDate'];

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

            if (!overallValidationPassed) {
                isValid = false;
            }

            // Check photos are uploaded or exist
            if (uploadedPhotos.length === 0 && existingPhotos.length === 0) {
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
            const fieldsToValidate = ['startPrice', 'bidIncrement', 'auctionType'];
            if (watch('auctionType') === 'reserve') {
                fieldsToValidate.push('reservePrice');
            }

            const overallValidationPassed = await trigger(fieldsToValidate);

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
        setUploadedPhotos([...uploadedPhotos, ...files]);
        clearErrors('photos');
    };

    const handleDocumentUpload = (e) => {
        const files = Array.from(e.target.files);
        setUploadedDocuments([...uploadedDocuments, ...files]);
    };

    const removePhoto = (index, isExisting = false) => {
        if (isExisting) {
            const removedPhoto = existingPhotos[index];
            setRemovedPhotos(prev => [...prev, removedPhoto.publicId || removedPhoto._id]);
            setExistingPhotos(existingPhotos.filter((_, i) => i !== index));
        } else {
            setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index));
        }

        if ((uploadedPhotos.length + existingPhotos.length) === 1) {
            setError('photos', {
                type: 'manual',
                message: 'At least one photo is required'
            });
        }
    };

    const removeDocument = (index, isExisting = false) => {
        if (isExisting) {
            const removedDoc = existingDocuments[index];
            setRemovedDocuments(prev => [...prev, removedDoc.publicId || removedDoc._id]);
            setExistingDocuments(existingDocuments.filter((_, i) => i !== index));
        } else {
            setUploadedDocuments(uploadedDocuments.filter((_, i) => i !== index));
        }
    };

    const updateAuctionHandler = async (formData) => {
        try {
            setIsSubmitting(true);

            const formDataToSend = new FormData();

            // Append all text fields
            formDataToSend.append('title', formData.title);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('location', formData.location || '');
            formDataToSend.append('videoLink', formData.video || '');
            formDataToSend.append('startPrice', formData.startPrice);
            formDataToSend.append('bidIncrement', formData.bidIncrement);
            formDataToSend.append('auctionType', formData.auctionType);
            // formDataToSend.append('startDate', formData.startDate);
            // formDataToSend.append('endDate', formData.endDate);
            formDataToSend.append('startDate', new Date(formData.startDate).toISOString());
            formDataToSend.append('endDate', new Date(formData.endDate).toISOString());

            // Get specifications from form data
            const currentSpecifications = formData.specifications || {};

            // Send the current specifications
            if (currentSpecifications && Object.keys(currentSpecifications).length > 0) {
                formDataToSend.append('specifications', JSON.stringify(currentSpecifications));
            }

            // Add removed photos and documents
            if (removedPhotos.length > 0) {
                formDataToSend.append('removedPhotos', JSON.stringify(removedPhotos));
            }

            if (removedDocuments.length > 0) {
                formDataToSend.append('removedDocuments', JSON.stringify(removedDocuments));
            }

            // Add reserve price if applicable
            if (formData.auctionType === 'reserve' && formData.reservePrice) {
                formDataToSend.append('reservePrice', formData.reservePrice);
            }

            // Append new photos
            uploadedPhotos.forEach((photo) => {
                formDataToSend.append('photos', photo);
            });

            // Append new documents
            uploadedDocuments.forEach((doc) => {
                formDataToSend.append('documents', doc);
            });

            // Use admin-specific endpoint if needed, or same endpoint with admin permissions
            const { data } = await axiosInstance.put(
                `/api/v1/admin/auctions/${auctionId}`,
                formDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            if (data.success) {
                toast.success('Auction updated successfully!');
                navigate('/admin/auctions/all');
            } else {
                throw new Error(data.message || 'Failed to update auction');
            }
        } catch (error) {
            console.error('Error updating auction:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to update auction';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="w-full relative">
                    <AdminHeader />
                    <AdminContainer>
                        <div className="pt-16 md:py-7 flex justify-center items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                        </div>
                    </AdminContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />

            <div className="w-full relative">
                <AdminHeader />

                <AdminContainer>
                    <div className="pt-16 md:py-7">
                        <div className="flex items-center gap-3 mb-5">
                            <button
                                onClick={() => navigate('/admin/auctions')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="text-3xl md:text-4xl font-bold">Edit Auction (Admin)</h1>
                        </div>
                        <p className="text-gray-600 mb-8">Update auction listing as administrator</p>

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

                        <form onSubmit={handleSubmit(updateAuctionHandler)} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
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
                                            onBlur={(value) => {
                                                setValue('description', value, { shouldValidate: true });
                                            }}
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label htmlFor="startDate" className="block text-sm font-medium text-secondary mb-1">Start Date & Time *</label>
                                            <div className="relative">
                                                <Clock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input
                                                    {...register('startDate', { required: 'Start date is required' })}
                                                    id="startDate"
                                                    type="datetime-local"
                                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                />
                                            </div>
                                            {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="endDate" className="block text-sm font-medium text-secondary mb-1">End Date & Time *</label>
                                            <div className="relative">
                                                <Clock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input
                                                    {...register('endDate', {
                                                        required: 'End date is required',
                                                        validate: {
                                                            afterStartDate: value => {
                                                                const start = new Date(watch('startDate'));
                                                                const end = new Date(value);
                                                                return end > start || 'End date must be after start date';
                                                            }
                                                        }
                                                    })}
                                                    id="endDate"
                                                    type="datetime-local"
                                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                />
                                            </div>
                                            {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>}
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
                                                <p className="text-sm text-secondary">Recommended: at least 3-5 high-quality photos</p>
                                            </label>
                                        </div>
                                        {errors.photos && <p className="text-red-500 text-sm mt-1">{errors.photos.message}</p>}

                                        {/* Display existing photos */}
                                        {existingPhotos.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-sm text-secondary mb-2">Existing Photos:</p>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {existingPhotos.map((photo, index) => (
                                                        <div key={`existing-${index}`} className="relative">
                                                            <img
                                                                src={photo.url}
                                                                alt={`Existing ${index + 1}`}
                                                                className="w-full h-32 object-cover rounded-lg"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removePhoto(index, true)}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Display newly uploaded photos */}
                                        {uploadedPhotos.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-sm text-secondary mb-2">New Photos:</p>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {uploadedPhotos.map((photo, index) => (
                                                        <div key={`new-${index}`} className="relative">
                                                            <img
                                                                src={URL.createObjectURL(photo)}
                                                                alt={`Upload ${index + 1}`}
                                                                className="w-full h-32 object-cover rounded-lg"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removePhoto(index, false)}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
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

                                        {/* Display existing documents */}
                                        {existingDocuments.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-sm text-secondary mb-2">Existing Documents:</p>
                                                <div className="space-y-2">
                                                    {existingDocuments.map((doc, index) => (
                                                        <div key={`existing-doc-${index}`} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                                            <span className="text-sm truncate">{doc.filename || doc.originalName}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeDocument(index, true)}
                                                                className="text-red-500"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Display newly uploaded documents */}
                                        {uploadedDocuments.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-sm text-secondary mb-2">New Documents:</p>
                                                <div className="space-y-2">
                                                    {uploadedDocuments.map((doc, index) => (
                                                        <div key={`new-doc-${index}`} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                                            <span className="text-sm truncate">{doc.name}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeDocument(index, false)}
                                                                className="text-red-500"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
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
                                                        <div>
                                                            <p className="text-xs text-secondary">Start Date</p>
                                                            <p className="font-medium">
                                                                {watch('startDate') ? new Date(watch('startDate')).toLocaleString() : 'Not provided'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-secondary">End Date</p>
                                                            <p className="font-medium">
                                                                {watch('endDate') ? new Date(watch('endDate')).toLocaleString() : 'Not provided'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Media */}
                                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                                    <h4 className="font-medium mb-3">Media & Documents</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <p className="text-xs text-secondary">Existing Photos</p>
                                                            <span className="font-medium bg-gray-100 px-2 py-1 rounded-full text-xs">
                                                                {existingPhotos.length} photos
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <p className="text-xs text-secondary">New Photos</p>
                                                            <span className="font-medium bg-gray-100 px-2 py-1 rounded-full text-xs">
                                                                {uploadedPhotos.length} uploaded
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <p className="text-xs text-secondary">Documents</p>
                                                            <span className="font-medium bg-gray-100 px-2 py-1 rounded-full text-xs">
                                                                {existingDocuments.length + uploadedDocuments.length} total
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
                                            e.preventDefault();
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
                                        disabled={isSubmitting}
                                        className="flex items-center px-6 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors disabled:opacity-50"
                                    >
                                        <Gavel size={18} className="mr-2" />
                                        {isSubmitting ? 'Updating Auction...' : 'Update Auction'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </AdminContainer>
            </div>
        </section>
    );
};

export default EditAuction;