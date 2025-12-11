import { faker } from '@faker-js/faker';
import fs from 'fs';

// Helper function to generate order lines
function generateOrderLines(count = 3) {
  const lines = [];
  for (let i = 0; i < count; i++) {
    lines.push({
      OrderLineID: `N${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}-${i}`,
      SKU: faker.helpers.arrayElement(['SAMPLE_P10', 'SAMPLE_P1_G', 'SAMPLE_P11', 'SAMPLE_P12', 'SAMPLE_V2_SML']) + faker.string.alphanumeric(3).toUpperCase(),
      ProductName: faker.commerce.productName(),
      Quantity: String(faker.number.int({ min: 1, max: 5 })),
      UnitPrice: faker.commerce.price({ min: 5, max: 500, dec: 2 }),
      PickQuantity: String(faker.number.int({ min: 0, max: 5 })),
      BackorderQuantity: String(faker.number.int({ min: 0, max: 2 })),
      Tax: faker.commerce.price({ min: 0, max: 50, dec: 2 }),
      TaxCode: faker.helpers.arrayElement(['GST', 'VAT', 'NONE']),
      WarehouseID: faker.number.int({ min: 1, max: 5 }),
      WarehouseName: faker.helpers.arrayElement(['Main Warehouse', 'East Coast', 'West Coast', 'Central']),
      WarehouseReference: `WH-${faker.string.alphanumeric(5).toUpperCase()}`,
      PercentDiscount: faker.commerce.price({ min: 0, max: 20, dec: 2 }),
      ProductDiscount: faker.commerce.price({ min: 0, max: 50, dec: 2 }),
      CostPrice: faker.commerce.price({ min: 3, max: 300, dec: 2 }),
      ShippingMethod: faker.helpers.arrayElement(['Standard Shipping', 'Express Shipping', 'Overnight']),
      ShippingTracking: faker.string.alphanumeric(16).toUpperCase(),
      Weight: faker.number.float({ min: 0.1, max: 25, precision: 0.01 }),
      BinLoc: `${faker.string.alpha(1).toUpperCase()}${faker.number.int({ min: 1, max: 99 })}-${faker.number.int({ min: 1, max: 20 })}`
    });
  }
  return lines;
}

// Main data generator
function main() {
  const data = {
    'maropost-orders': [],
    'maropost-customers': [],
    'maropost-products': []
  };

  // Generate 50 Orders (matching Neto API structure)
  for (let i = 1; i <= 50; i++) {
    const orderId = `N${String(i).padStart(6, '0')}`;
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const company = faker.helpers.maybe(() => faker.company.name(), { probability: 0.3 });
    
    const orderLines = generateOrderLines(faker.number.int({ min: 1, max: 4 }));
    
    // Calculate totals from order lines
    const productSubtotal = orderLines.reduce((sum, line) => 
      sum + (parseFloat(line.UnitPrice) * parseInt(line.Quantity)), 0
    );
    const shippingTotal = parseFloat(faker.commerce.price({ min: 5, max: 30, dec: 2 }));
    const orderTax = orderLines.reduce((sum, line) => sum + parseFloat(line.Tax), 0);
    const grandTotal = productSubtotal + shippingTotal + orderTax;

    data['maropost-orders'].push({
      OrderID: orderId,
      ID: orderId,
      Username: faker.internet.username(),
      Email: faker.internet.email(),
      
      // Billing Address
      BillFirstName: firstName,
      BillLastName: lastName,
      BillCompany: company || '',
      BillStreetLine1: faker.location.streetAddress(),
      BillStreetLine2: faker.helpers.maybe(() => faker.location.secondaryAddress(), { probability: 0.3 }) || '',
      BillCity: faker.location.city().toUpperCase(),
      BillState: faker.location.state({ abbreviated: true }),
      BillCountry: faker.helpers.arrayElement(['AU', 'US', 'GB', 'NZ']),
      BillPostCode: faker.location.zipCode(),
      BillPhone: faker.phone.number(),
      
      // Shipping Address (sometimes different)
      ShipFirstName: faker.helpers.maybe(() => faker.person.firstName(), { probability: 0.8 }) || firstName,
      ShipLastName: faker.helpers.maybe(() => faker.person.lastName(), { probability: 0.8 }) || lastName,
      ShipCompany: faker.helpers.maybe(() => faker.company.name(), { probability: 0.3 }) || company || '',
      ShipStreetLine1: faker.location.streetAddress(),
      ShipStreetLine2: faker.helpers.maybe(() => faker.location.secondaryAddress(), { probability: 0.3 }) || '',
      ShipCity: faker.location.city().toUpperCase(),
      ShipState: faker.location.state({ abbreviated: true }),
      ShipCountry: faker.helpers.arrayElement(['AU', 'US', 'GB', 'NZ']),
      ShipPostCode: faker.location.zipCode(),
      ShipPhone: faker.phone.number(),
      
      // Order Details
      OrderStatus: faker.helpers.arrayElement(['New', 'New Backorder', 'Pick', 'Pack', 'Pending Dispatch', 'Dispatched', 'On Hold']),
      OrderType: faker.helpers.arrayElement(['sales', 'dropshipping']),
      ShippingOption: faker.helpers.arrayElement(['Standard Shipping', 'Express Shipping', 'Overnight', 'Free Shipping']),
      ShippingSignature: faker.datatype.boolean(),
      DeliveryInstruction: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.4 }) || '',
      
      // Financial
      GrandTotal: grandTotal.toFixed(2),
      ProductSubtotal: productSubtotal.toFixed(2),
      ShippingTotal: shippingTotal.toFixed(2),
      ShippingTax: (shippingTotal * 0.1).toFixed(2),
      OrderTax: orderTax.toFixed(2),
      TaxInclusive: faker.datatype.boolean(),
      ShippingDiscount: faker.commerce.price({ min: 0, max: 10, dec: 2 }),
      CouponCode: faker.helpers.maybe(() => faker.string.alphanumeric(8).toUpperCase(), { probability: 0.2 }) || '',
      CouponDiscount: faker.helpers.maybe(() => faker.commerce.price({ min: 5, max: 50, dec: 2 }), { probability: 0.2 }) || '0.00',
      
      // Dates
      DatePlaced: faker.date.between({ from: '2024-01-01', to: '2024-12-31' }).toISOString().replace('T', ' ').substring(0, 19),
      DateRequired: faker.helpers.maybe(() => 
        faker.date.soon({ days: 7 }).toISOString().replace('T', ' ').substring(0, 19), 
        { probability: 0.6 }
      ) || '',
      DateInvoiced: faker.date.recent({ days: 30 }).toISOString().replace('T', ' ').substring(0, 19),
      DatePaid: faker.helpers.maybe(() => 
        faker.date.recent({ days: 30 }).toISOString().replace('T', ' ').substring(0, 19), 
        { probability: 0.8 }
      ) || '',
      
      // References
      PurchaseOrderNumber: faker.helpers.maybe(() => `PO-${faker.string.alphanumeric(10).toUpperCase()}`, { probability: 0.3 }) || '',
      SalesChannel: faker.helpers.arrayElement(['Web', 'eBay', 'Amazon', 'Phone', 'In-Store']),
      SalesPerson: faker.helpers.maybe(() => faker.person.fullName(), { probability: 0.4 }) || '',
      
      // Order Lines
      OrderLine: orderLines,
      
      // Additional fields
      CompleteStatus: faker.helpers.arrayElement(['Approved', 'Incomplete']),
      PaymentStatus: faker.helpers.arrayElement(['FullyPaid', 'PartialPaid', 'Pending']),
      InternalOrderNotes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) || ''
    });
  }

  // Generate 30 Customers
  for (let i = 1; i <= 30; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    data["maropost-customers"].push({
      CustomerID: `C${String(i).padStart(6, '0')}`,
      Username: faker.internet.username(),
      Email: faker.internet.email(),
      FirstName: firstName,
      LastName: lastName,
      Company: faker.helpers.maybe(() => faker.company.name(), { probability: 0.4 }) || '',
      Phone: faker.phone.number(),
      Mobile: faker.phone.number(),
      
      // Default Address
      StreetLine1: faker.location.streetAddress(),
      StreetLine2: faker.helpers.maybe(() => faker.location.secondaryAddress(), { probability: 0.3 }) || '',
      City: faker.location.city(),
      State: faker.location.state({ abbreviated: true }),
      Country: faker.helpers.arrayElement(['AU', 'US', 'GB', 'NZ']),
      PostCode: faker.location.zipCode(),
      
      // Customer Details
      DOB: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }).toISOString().split('T')[0],
      Gender: faker.helpers.arrayElement(['Male', 'Female', 'Other', '']),
      NewsletterSubscriber: faker.datatype.boolean(),
      
      // Dates
      DateCreated: faker.date.past({ years: 3 }).toISOString().replace('T', ' ').substring(0, 19),
      DateLastLogin: faker.date.recent({ days: 30 }).toISOString().replace('T', ' ').substring(0, 19),
      
      // Stats
      TotalOrders: faker.number.int({ min: 0, max: 50 }),
      TotalSpent: faker.commerce.price({ min: 0, max: 5000, dec: 2 }),
      AverageOrderValue: faker.commerce.price({ min: 50, max: 500, dec: 2 })
    });
  }

  // Generate 100 Products
  for (let i = 1; i <= 100; i++) {
    const productName = faker.commerce.productName();
    const brand = faker.company.name();
    
    data["maropost-products"].push({
      ProductID: i,
      SKU: `PROD-${faker.string.alphanumeric(8).toUpperCase()}`,
      Name: productName,
      Brand: brand,
      Model: faker.vehicle.model(),
      
      // Pricing
      DefaultPrice: faker.commerce.price({ min: 10, max: 1000, dec: 2 }),
      CostPrice: faker.commerce.price({ min: 5, max: 500, dec: 2 }),
      RRP: faker.commerce.price({ min: 15, max: 1500, dec: 2 }),
      
      // Inventory
      WarehouseQuantity: faker.number.int({ min: 0, max: 500 }),
      CommittedQuantity: faker.number.int({ min: 0, max: 50 }),
      AvailableQuantity: faker.number.int({ min: 0, max: 450 }),
      
      // Details
      ShortDescription: faker.commerce.productDescription(),
      Description: faker.lorem.paragraphs(2),
      Weight: faker.number.float({ min: 0.1, max: 50, precision: 0.01 }),
      Dimensions: `${faker.number.int({ min: 10, max: 100 })}x${faker.number.int({ min: 10, max: 100 })}x${faker.number.int({ min: 10, max: 100 })}`,
      
      // Classification
      Category: faker.helpers.arrayElement(['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys']),
      Subcategory: faker.commerce.department(),
      
      // Status
      IsActive: faker.datatype.boolean(),
      IsVisible: faker.datatype.boolean(),
      IsFeatured: faker.helpers.maybe(() => true, { probability: 0.2 }) || false,
      
      // Dates
      DateCreated: faker.date.past({ years: 2 }).toISOString().replace('T', ' ').substring(0, 19),
      DateUpdated: faker.date.recent({ days: 90 }).toISOString().replace('T', ' ').substring(0, 19),
      
      // SEO
      MetaTitle: faker.helpers.maybe(() => faker.lorem.words(5), { probability: 0.6 }) || '',
      MetaDescription: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.6 }) || '',
      
      // Supplier
      SupplierSKU: faker.helpers.maybe(() => `SUP-${faker.string.alphanumeric(10).toUpperCase()}`, { probability: 0.7 }) || '',
      SupplierName: faker.helpers.maybe(() => faker.company.name(), { probability: 0.7 }) || ''
    });
  }

  const content = JSON.stringify(data);
  const filePath = 'fixtures/db.json'; // Specify your desired path

  fs.writeFile(filePath, content, err => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('File has been written successfully to ' + filePath);
});
  return data;
};

main();