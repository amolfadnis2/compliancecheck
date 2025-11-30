import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

// Register fonts (using system fonts)
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 700 },
  ],
})

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Inter',
    color: '#1F2937',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #3B82F6',
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1E40AF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  companyInfo: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 5,
  },
  companyDetail: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 2,
  },
  scoreSection: {
    marginBottom: 25,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 700,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    padding: '6 12',
    borderRadius: 12,
    marginTop: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 600,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 12,
    color: '#1F2937',
    borderBottom: '1 solid #E5E7EB',
    paddingBottom: 6,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8 12',
    marginBottom: 6,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
  },
  categoryName: {
    fontSize: 11,
    flex: 1,
  },
  categoryScore: {
    fontSize: 11,
    fontWeight: 600,
    width: 50,
    textAlign: 'right',
  },
  progressBar: {
    width: 100,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginLeft: 10,
    marginRight: 10,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  actionItem: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 6,
    borderRadius: 6,
    border: '1 solid #E5E7EB',
  },
  priorityBadge: {
    padding: '4 8',
    borderRadius: 4,
    marginRight: 10,
    fontSize: 9,
    fontWeight: 600,
  },
  priorityHigh: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
  },
  priorityMedium: {
    backgroundColor: '#FEF3C7',
    color: '#B45309',
  },
  priorityLow: {
    backgroundColor: '#DBEAFE',
    color: '#1D4ED8',
  },
  actionText: {
    fontSize: 10,
    flex: 1,
    color: '#374151',
  },
  actionCategory: {
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1 solid #E5E7EB',
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 9,
    color: '#9CA3AF',
  },
  disclaimer: {
    marginTop: 25,
    padding: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 6,
    borderLeft: '3 solid #F59E0B',
  },
  disclaimerText: {
    fontSize: 9,
    color: '#92400E',
  },
})

// Color helpers
const getStatusColor = (score: number) => {
  if (score >= 70) return { bg: '#DCFCE7', text: '#166534' }
  if (score >= 40) return { bg: '#FEF3C7', text: '#B45309' }
  return { bg: '#FEE2E2', text: '#B91C1C' }
}

const getProgressColor = (score: number) => {
  if (score >= 70) return '#22C55E'
  if (score >= 40) return '#F59E0B'
  return '#EF4444'
}


// Types
interface ActionItem {
  priority: 'high' | 'medium' | 'low'
  text: string
  category: string
}

interface CategoryScore {
  name: string
  score: number
}

interface ReportData {
  assessmentType: 'statutory_health' | 'labour_code'
  companyName: string
  industry?: string
  employeeCount?: string
  state?: string
  overallScore: number
  status: string
  categoryScores: CategoryScore[]
  actionItems: ActionItem[]
  generatedAt: string
}

// Main PDF Component
export const ComplianceReport = ({ data }: { data: ReportData }) => {
  const statusColor = getStatusColor(data.overallScore)
  const isLabourCode = data.assessmentType === 'labour_code'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>ComplianceCheck</Text>
          <Text style={styles.subtitle}>
            {isLabourCode ? 'Labour Code Readiness Report' : 'Statutory Health Check Report'}
          </Text>
        </View>

        {/* Company Info */}
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{data.companyName}</Text>
          {data.industry && <Text style={styles.companyDetail}>Industry: {data.industry}</Text>}
          {data.employeeCount && <Text style={styles.companyDetail}>Employees: {data.employeeCount}</Text>}
          {data.state && <Text style={styles.companyDetail}>State: {data.state}</Text>}
        </View>

        {/* Overall Score */}
        <View style={[styles.scoreSection, { backgroundColor: statusColor.bg }]}>
          <View style={[styles.scoreCircle, { backgroundColor: 'white' }]}>
            <Text style={[styles.scoreValue, { color: statusColor.text }]}>
              {data.overallScore}%
            </Text>
          </View>
          <Text style={styles.scoreLabel}>
            {isLabourCode ? 'Overall Readiness Score' : 'Overall Compliance Score'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: 'white' }]}>
            <Text style={[styles.statusText, { color: statusColor.text }]}>
              {data.status}
            </Text>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={{ marginBottom: 25 }}>
          <Text style={styles.sectionTitle}>
            {isLabourCode ? 'Labour Code Breakdown' : 'Category Breakdown'}
          </Text>
          {data.categoryScores.map((cat, index) => (
            <View key={index} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{cat.name}</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${cat.score}%`,
                      backgroundColor: getProgressColor(cat.score),
                    },
                  ]}
                />
              </View>
              <Text style={[styles.categoryScore, { color: getProgressColor(cat.score) }]}>
                {cat.score}%
              </Text>
            </View>
          ))}
        </View>

        {/* Action Items */}
        {data.actionItems.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionTitle}>Priority Action Items</Text>
            {data.actionItems.slice(0, 10).map((item, index) => (
              <View key={index} style={styles.actionItem}>
                <View
                  style={[
                    styles.priorityBadge,
                    item.priority === 'high' ? styles.priorityHigh :
                    item.priority === 'medium' ? styles.priorityMedium :
                    styles.priorityLow,
                  ]}
                >
                  <Text>{item.priority.toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionText}>{item.text}</Text>
                  <Text style={styles.actionCategory}>{item.category}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Disclaimer: This report is for informational purposes only and does not constitute 
            legal advice. Please consult a qualified legal or compliance professional for 
            specific guidance on your compliance obligations.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Generated by ComplianceCheck</Text>
          <Text style={styles.footerText}>{data.generatedAt}</Text>
        </View>
      </Page>
    </Document>
  )
}

export default ComplianceReport
