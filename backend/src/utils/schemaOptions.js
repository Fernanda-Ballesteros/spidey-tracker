"use strict";

module.exports = {
    timestamps: true,
    toJSON: {
        versionKey: false,
        transform: (_doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            return ret;
        },
    },
};
