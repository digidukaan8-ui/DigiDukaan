import mongoose from 'mongoose';

const cityMappingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    type: {
        type: String,
        enum: ['city', 'town', 'locality'],
        default: 'city',
        required: true
    },
    areas: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    pincodes: [{
        type: String,
        trim: true
    }],
    city: {
        type: String,
        trim: true,
        lowercase: true
    }
}, {
    timestamps: true
});

cityMappingSchema.index({ name: 'text', areas: 'text' });

const CityMapping = mongoose.model('CityMapping', cityMappingSchema);

export default CityMapping;