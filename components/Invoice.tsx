'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define styles using standard styles configurations
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontSize: 11,
    color: '#333333',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f3efe6',
    paddingBottom: 20,
    marginBottom: 30,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#C9A227', // MW Hotel theme gold Accent
    letterSpacing: 1,
  },
  invoiceTitle: {
    fontSize: 16,
    textAlign: 'right',
    color: '#161204',
  },
  metaText: {
    fontSize: 9,
    color: '#777777',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#161204',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  table: {
    width: 'auto',
    marginVertical: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#fcfbfa',
    paddingVertical: 8,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#161204',
    color: '#ffffff',
    fontWeight: 'bold',
  },
  colDescription: { width: '60%', paddingLeft: 6 },
  colQty: { width: '15%', textAlign: 'center' },
  colAmount: { width: '25%', textAlign: 'right', paddingRight: 6 },
  thText: { color: '#e5c158', fontSize: 10, fontWeight: 'bold' },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  totalBox: {
    width: '40%',
    borderTopWidth: 2,
    borderTopColor: '#C9A227',
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  grandTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#C9A227',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3efe6',
    paddingTop: 10,
    fontSize: 8,
    color: '#999999',
  },
});

interface InvoiceProps {
  invoiceNumber: string;
  date: string;
  guestName: string;
  roomDetails: string;
  amount: number;
}

export default function InvoiceDocument({ data }: { data: InvoiceProps }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Segment */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>MW Hotel</Text>
            <Text style={styles.metaText}>Premium Hospitality Group</Text>
            <Text style={styles.metaText}>Addis Ababa, Ethiopia</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.invoiceTitle}>INVOICE / RECEIPT</Text>
            <Text style={styles.metaText}>Invoice No: {data.invoiceNumber}</Text>
            <Text style={styles.metaText}>Date: {data.date}</Text>
          </View>
        </View>

        {/* Client details / Folio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billed To</Text>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 2 }}>{data.guestName}</Text>
          <Text style={styles.metaText}>Verified Guest Folio Profile</Text>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.colDescription}><Text style={styles.thText}>Description / Itinerary</Text></View>
            <View style={styles.colQty}><Text style={styles.thText}>Qty</Text></View>
            <View style={styles.colAmount}><Text style={styles.thText}>Amount</Text></View>
          </View>
          
          {/* Table Row */}
          <View style={styles.tableRow}>
            <View style={styles.colDescription}>
              <Text style={{ fontWeight: 'bold' }}>{data.roomDetails}</Text>
            </View>
            <View style={styles.colQty}><Text>1</Text></View>
            <View style={styles.colAmount}><Text>{data.amount.toLocaleString()} ETB</Text></View>
          </View>
        </View>

        {/* Summary Totals Calculation */}
        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <Text style={{ color: '#777777' }}>Subtotal:</Text>
              <Text>{data.amount.toLocaleString()} ETB</Text>
            </View>
            <View style={[styles.totalRow, { marginTop: 6 }]}>
              <Text style={{ fontWeight: 'bold' }}>Total Due:</Text>
              <Text style={styles.grandTotal}>{data.amount.toLocaleString()} ETB</Text>
            </View>
          </View>
        </View>

        {/* Regulatory/Closing Terms Footer */}
        <View style={styles.footer}>
          <Text>Thank you for choosing MW Hotel. Elegant experiences, beautifully crafted.</Text>
          <Text style={{ marginTop: 2 }}>This document serves as an official electronic record of reservation settlement.</Text>
        </View>
      </Page>
    </Document>
  );
}