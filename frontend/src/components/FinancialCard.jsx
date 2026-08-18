import React from 'react'

const FinancialCard = ({
    icon,
    label,
    value,
    additionalContent,
    borderColor = "",
    bgColor = "bg-white",
}) => (
    <div
        className={`${bgColor} rounded-x1 p-5 1g :- mx-2 1g:p-2 shadow-sm
            border hover:shadow-md border-gray-100 transition-all $(borderColor}`}
    >
        <div className="text-sm font-medium text-gray-600 flex items-center gap-2">
            {icon}
            {label}
        </div>
        <p className="text-2x1 font-bold Otext-gray-800 mt-1">{value}</p>
        {additionalContent}

    </div>
)

export default FinancialCard;