// Export Utilities for CSV and PDF
// Provides functions to export orders and users data

// Export to CSV
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }
    
    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    let csv = headers.join(',') + '\n';
    
    data.forEach(row => {
        const values = headers.map(header => {
            const val = row[header];
            // Handle nested objects
            if (typeof val === 'object' && val !== null) {
                return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
            }
            // Escape quotes and wrap in quotes
            return `"${String(val || '').replace(/"/g, '""')}"`;
        });
        csv += values.join(',') + '\n';
    });
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

// Export Orders to CSV
function exportOrdersToCSV(orders) {
    const exportData = orders.map(order => ({
        'Order ID': order.orderId || order.id,
        'Customer Name': order.shipping?.name || order.customerName || 'N/A',
        'Customer Email': order.shipping?.email || order.customerEmail || 'N/A',
        'Customer Phone': order.shipping?.phone || 'N/A',
        'Items Count': order.order?.items?.length || order.items?.length || 0,
        'Total Amount': order.order?.total || order.total || 0,
        'Status': order.status || 'pending',
        'Payment Method': order.payment?.method || 'N/A',
        'Date': order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : 'N/A',
        'Shipping Address': `${order.shipping?.addressLine1 || ''}, ${order.shipping?.city || ''}, ${order.shipping?.state || ''} ${order.shipping?.pincode || ''}`.trim()
    }));
    
    const filename = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(exportData, filename);
}

// Export Users to CSV
function exportUsersToCSV(users) {
    const exportData = users.map(user => ({
        'Name': user.fullName || 'N/A',
        'Email': user.email || 'N/A',
        'Phone': user.phone || 'N/A',
        'City': user.address?.city || 'N/A',
        'State': user.address?.state || 'N/A',
        'Postal Code': user.address?.postalCode || 'N/A',
        'Joined Date': (user.createdAt || user.lastUpdated) ? new Date(user.createdAt || user.lastUpdated).toLocaleString('en-IN') : 'N/A',
        'Email Verified': user.emailVerified ? 'Yes' : 'No',
        'Provider': user.provider || 'N/A'
    }));
    
    const filename = `users_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(exportData, filename);
}

// Export to PDF (simple text-based PDF)
async function exportToPDF(data, title, filename) {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }
    
    // Simple PDF generation using jsPDF (load from CDN)
    try {
        // Check if jsPDF is loaded
        if (typeof window.jspdf === 'undefined') {
            // Load jsPDF dynamically
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => exportToPDF(data, title, filename);
            document.head.appendChild(script);
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(18);
        doc.text(title, 14, 20);
        
        // Add date
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, 30);
        
        // Add data
        let y = 40;
        const pageHeight = doc.internal.pageSize.height;
        
        data.forEach((item, index) => {
            if (y > pageHeight - 20) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(`${index + 1}. ${item.title || item.name || `Item ${index + 1}`}`, 14, y);
            y += 7;
            
            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            
            Object.entries(item).forEach(([key, value]) => {
                if (key === 'title' || key === 'name') return;
                
                if (y > pageHeight - 20) {
                    doc.addPage();
                    y = 20;
                }
                
                let displayValue = value;
                if (typeof value === 'object' && value !== null) {
                    displayValue = JSON.stringify(value);
                }
                
                doc.text(`${key}: ${displayValue}`, 20, y);
                y += 5;
            });
            
            y += 5; // Add space between items
        });
        
        // Save
        doc.save(filename);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try CSV export instead.');
    }
}

// Export Orders to PDF
function exportOrdersToPDF(orders) {
    const exportData = orders.map(order => ({
        title: `Order ${order.orderId || order.id}`,
        'Customer': order.shipping?.name || order.customerName || 'N/A',
        'Email': order.shipping?.email || order.customerEmail || 'N/A',
        'Phone': order.shipping?.phone || 'N/A',
        'Items': order.order?.items?.length || order.items?.length || 0,
        'Total': `₹ ${(order.order?.total || order.total || 0).toLocaleString('en-IN')}`,
        'Status': order.status || 'pending',
        'Payment': order.payment?.method || 'N/A',
        'Date': order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : 'N/A'
    }));
    
    const filename = `orders_${new Date().toISOString().split('T')[0]}.pdf`;
    exportToPDF(exportData, 'Orders Report', filename);
}

// Export Users to PDF
function exportUsersToPDF(users) {
    const exportData = users.map(user => ({
        name: user.fullName || 'N/A',
        'Email': user.email || 'N/A',
        'Phone': user.phone || 'N/A',
        'City': user.address?.city || 'N/A',
        'Joined': (user.createdAt || user.lastUpdated) ? new Date(user.createdAt || user.lastUpdated).toLocaleString('en-IN') : 'N/A'
    }));
    
    const filename = `users_${new Date().toISOString().split('T')[0]}.pdf`;
    exportToPDF(exportData, 'Users Report', filename);
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.exportUtils = {
        exportToCSV,
        exportToPDF,
        exportOrdersToCSV,
        exportUsersToCSV,
        exportOrdersToPDF,
        exportUsersToPDF
    };
}

export {
    exportToCSV,
    exportToPDF,
    exportOrdersToCSV,
    exportUsersToCSV,
    exportOrdersToPDF,
    exportUsersToPDF
};
