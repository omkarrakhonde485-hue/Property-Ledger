import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    properties: "Properties",
    tenants: "Tenants",
    payments: "Payments",
    expenses: "Expenses",
    reports: "Reports",
    settings: "Settings",
    
    // Dashboard
    totalProperties: "Total Properties",
    totalRooms: "Total Rooms",
    totalBeds: "Total Beds",
    activeTenants: "Active Tenants",
    vacantBeds: "Vacant Beds",
    occupancyRate: "Occupancy Rate",
    expectedRent: "Expected Rent",
    collectedRent: "Collected Rent",
    outstandingRent: "Outstanding Rent",
    monthlyExpenses: "Monthly Expenses",
    overdueRent: "Overdue Rent",
    vacatingSoon: "Vacating Soon",
    expiringDocuments: "Expiring Documents",
    reservedBeds: "Reserved Beds",
    quickActions: "Quick Actions",
    alerts: "Alerts",
    
    // Actions
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    search: "Search",
    filter: "Filter",
    export: "Export",
    addTenant: "Add Tenant",
    recordPayment: "Record Payment",
    addExpense: "Add Expense",
    sendReminder: "Send Reminder",
    addProperty: "Add Property",
    addFloor: "Add Floor",
    addRoom: "Add Room",
    addBed: "Add Bed",
    addNote: "Add Note",
    uploadDocument: "Upload Document",
    markNoticeGiven: "Mark Notice Given",
    markVacated: "Mark Vacated",
    
    // Property
    propertyName: "Property Name",
    address: "Address",
    city: "City",
    state: "State",
    pincode: "Pincode",
    description: "Description",
    rooms: "Rooms",
    beds: "Beds",
    occupancy: "Occupancy",
    revenue: "Revenue",
    overview: "Overview",
    floors: "Floors",
    notes: "Notes",
    
    // Floor
    floorName: "Floor Name",
    floorNumber: "Floor Number",
    roomsCount: "Rooms Count",
    
    // Room
    roomNumber: "Room Number",
    floor: "Floor",
    capacity: "Capacity",
    occupied: "Occupied",
    status: "Status",
    monthlyRent: "Monthly Rent",
    
    // Bed
    bedNumber: "Bed Number",
    reservedFor: "Reserved For",
    joinDate: "Join Date",
    
    // Tenant
    fullName: "Full Name",
    mobileNumber: "Mobile Number",
    alternateMobile: "Alternate Mobile",
    aadhaarNumber: "Aadhaar Number",
    occupation: "Occupation",
    companyName: "Company Name",
    emergencyContactName: "Emergency Contact Name",
    emergencyContactNumber: "Emergency Contact Number",
    familyMemberCount: "Family Members",
    joiningDate: "Joining Date",
    vacatingDate: "Vacating Date",
    securityDeposit: "Security Deposit",
    personalInfo: "Personal Information",
    rentInfo: "Rent Information",
    depositInfo: "Deposit Information",
    documents: "Documents",
    timeline: "Timeline",
    
    // Payment
    paymentDate: "Payment Date",
    amount: "Amount",
    paymentMethod: "Payment Method",
    referenceNumber: "Reference Number",
    remarks: "Remarks",
    paymentHistory: "Payment History",
    pendingDues: "Pending Dues",
    
    // Expense
    category: "Category",
    expenseDate: "Expense Date",
    
    // Status
    active: "Active",
    noticeGiven: "Notice Given",
    vacated: "Vacated",
    vacant: "Vacant",
    partiallyOccupied: "Partially Occupied",
    fullyOccupied: "Fully Occupied",
    reserved: "Reserved",
    paid: "Paid",
    partiallyPaid: "Partially Paid",
    unpaid: "Unpaid",
    held: "Held",
    refunded: "Refunded",
    
    // Reports
    occupancyReport: "Occupancy Report",
    revenueReport: "Revenue Report",
    outstandingReport: "Outstanding Report",
    expenseReport: "Expense Report",
    exportPDF: "Export PDF",
    exportExcel: "Export Excel",
    
    // Settings
    account: "Account",
    preferences: "Preferences",
    language: "Language",
    english: "English",
    marathi: "मराठी",
    name: "Name",
    email: "Email",
    phone: "Phone",
    
    // General
    noData: "No data available",
    confirmDelete: "Are you sure you want to delete?",
    loading: "Loading...",
    total: "Total",
    monthly: "Monthly",
    yearly: "Yearly",
    all: "All",
    property: "Property",
    room: "Room",
    bed: "Bed",
    tenant: "Tenant",
    viewAll: "View All",
    details: "Details",
    back: "Back",
    close: "Close",
    deposit: "Deposit",
    refund: "Refund",
    date: "Date",
    month: "Month",
    year: "Year",
  },
  mr: {
    // Navigation
    dashboard: "डॅशबोर्ड",
    properties: "मालमत्ता",
    tenants: "भाडेकरू",
    payments: "पेमेंट्स",
    expenses: "खर्च",
    reports: "अहवाल",
    settings: "सेटिंग्ज",
    
    // Dashboard
    totalProperties: "एकूण मालमत्ता",
    totalRooms: "एकूण खोल्या",
    totalBeds: "एकूण बेड्स",
    activeTenants: "सक्रिय भाडेकरू",
    vacantBeds: "रिक्त बेड्स",
    occupancyRate: "भरणी दर",
    expectedRent: "अपेक्षित भाडे",
    collectedRent: "जमा भाडे",
    outstandingRent: "थकीत भाडे",
    monthlyExpenses: "मासिक खर्च",
    overdueRent: "थकीत भाडे",
    vacatingSoon: "लवकर जाणारे",
    expiringDocuments: "कालबाह्य कागदपत्रे",
    reservedBeds: "आरक्षित बेड्स",
    quickActions: "त्वरित कृती",
    alerts: "सूचना",
    
    // Actions
    add: "जोडा",
    edit: "संपादित करा",
    delete: "हटवा",
    save: "जतन करा",
    cancel: "रद्द करा",
    search: "शोधा",
    filter: "फिल्टर",
    export: "निर्यात",
    addTenant: "भाडेकरू जोडा",
    recordPayment: "पेमेंट नोंदवा",
    addExpense: "खर्च जोडा",
    sendReminder: "स्मरणपत्र पाठवा",
    addProperty: "मालमत्ता जोडा",
    addFloor: "मजला जोडा",
    addRoom: "खोली जोडा",
    addBed: "बेड जोडा",
    addNote: "टीप जोडा",
    uploadDocument: "कागदपत्र अपलोड करा",
    markNoticeGiven: "नोटीस दिली",
    markVacated: "खाली केले",
    
    // Property
    propertyName: "मालमत्तेचे नाव",
    address: "पत्ता",
    city: "शहर",
    state: "राज्य",
    pincode: "पिनकोड",
    description: "वर्णन",
    rooms: "खोल्या",
    beds: "बेड्स",
    occupancy: "भरणी",
    revenue: "उत्पन्न",
    overview: "विहंगावलोकन",
    floors: "मजले",
    notes: "टिपा",
    
    // Floor
    floorName: "मजल्याचे नाव",
    floorNumber: "मजला क्रमांक",
    roomsCount: "खोल्यांची संख्या",
    
    // Room
    roomNumber: "खोली क्रमांक",
    floor: "मजला",
    capacity: "क्षमता",
    occupied: "भरलेले",
    status: "स्थिती",
    monthlyRent: "मासिक भाडे",
    
    // Bed
    bedNumber: "बेड क्रमांक",
    reservedFor: "यासाठी आरक्षित",
    joinDate: "सामील होण्याची तारीख",
    
    // Tenant
    fullName: "पूर्ण नाव",
    mobileNumber: "मोबाइल नंबर",
    alternateMobile: "पर्यायी मोबाइल",
    aadhaarNumber: "आधार नंबर",
    occupation: "व्यवसाय",
    companyName: "कंपनीचे नाव",
    emergencyContactName: "आपत्कालीन संपर्क नाव",
    emergencyContactNumber: "आपत्कालीन संपर्क नंबर",
    familyMemberCount: "कुटुंबातील सदस्य",
    joiningDate: "सामील तारीख",
    vacatingDate: "खाली करण्याची तारीख",
    securityDeposit: "सुरक्षा ठेव",
    personalInfo: "वैयक्तिक माहिती",
    rentInfo: "भाडे माहिती",
    depositInfo: "ठेव माहिती",
    documents: "कागदपत्रे",
    timeline: "टाइमलाइन",
    
    // Payment
    paymentDate: "पेमेंट तारीख",
    amount: "रक्कम",
    paymentMethod: "पेमेंट पद्धत",
    referenceNumber: "संदर्भ क्रमांक",
    remarks: "शेरा",
    paymentHistory: "पेमेंट इतिहास",
    pendingDues: "प्रलंबित थकबाकी",
    
    // Expense
    category: "श्रेणी",
    expenseDate: "खर्चाची तारीख",
    
    // Status
    active: "सक्रिय",
    noticeGiven: "नोटीस दिली",
    vacated: "खाली",
    vacant: "रिक्त",
    partiallyOccupied: "अंशतः भरलेले",
    fullyOccupied: "पूर्ण भरलेले",
    reserved: "आरक्षित",
    paid: "भरले",
    partiallyPaid: "अंशतः भरले",
    unpaid: "न भरलेले",
    held: "ठेवलेले",
    refunded: "परत केले",
    
    // Reports
    occupancyReport: "भरणी अहवाल",
    revenueReport: "उत्पन्न अहवाल",
    outstandingReport: "थकबाकी अहवाल",
    expenseReport: "खर्च अहवाल",
    exportPDF: "PDF निर्यात",
    exportExcel: "Excel निर्यात",
    
    // Settings
    account: "खाते",
    preferences: "प्राधान्ये",
    language: "भाषा",
    english: "English",
    marathi: "मराठी",
    name: "नाव",
    email: "ईमेल",
    phone: "फोन",
    
    // General
    noData: "डेटा उपलब्ध नाही",
    confirmDelete: "तुम्हाला खात्री आहे का?",
    loading: "लोड होत आहे...",
    total: "एकूण",
    monthly: "मासिक",
    yearly: "वार्षिक",
    all: "सर्व",
    property: "मालमत्ता",
    room: "खोली",
    bed: "बेड",
    tenant: "भाडेकरू",
    viewAll: "सर्व पहा",
    details: "तपशील",
    back: "मागे",
    close: "बंद करा",
    deposit: "ठेव",
    refund: "परतावा",
    date: "तारीख",
    month: "महिना",
    year: "वर्ष",
  }
};

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('pl_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('pl_lang', lang);
  }, [lang]);

  const t = (key) => translations[lang]?.[key] || translations.en[key] || key;

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}