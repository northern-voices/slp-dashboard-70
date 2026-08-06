import { View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer'

Font.register({
  family: 'Gotu',
  src: 'https://fonts.gstatic.com/s/gotu/v18/o-0FIpksx3QOpHoBjqp56hQ.ttf',
})

Font.register({
  family: 'Nunito',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/nunito/v32/XRXI3I6Li01BKofiOc5wtlZ2di8HDLshdTQ3iqzdXWg.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/nunito/v32/XRXI3I6Li01BKofiOc5wtlZ2di8HDFwmdTQ3iqzdXWg.ttf',
      fontWeight: 700,
    },
  ],
})

Font.register({
  family: 'Montserrat',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aX9-obK4.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM73w5aX9-obK4.ttf',
      fontWeight: 700,
    },
  ],
})

const BANNER_BG = '#5b7a8b'

const chromeStyles = StyleSheet.create({
  banner: {
    backgroundColor: BANNER_BG,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTitle: { fontFamily: 'Gotu', color: '#ffffff', letterSpacing: 0.5 },
  bannerBrand: { flexDirection: 'row', alignItems: 'center' },
  bannerLogo: { width: 26, height: 26, borderRadius: 4, marginRight: 8 },
  bannerBrandText: {
    fontSize: 9,
    fontFamily: 'Nunito',
    fontWeight: 700,
    letterSpacing: 1,
    color: '#ffffff',
  },
  bannerBrandSub: {
    fontSize: 6,
    fontFamily: 'Montserrat',
    letterSpacing: 2,
    color: '#e5eaec',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    fontSize: 8,
    color: '#6b7280',
  },
  footerLogo: { width: 12, height: 12, marginRight: 4 },
  footerPage: { flexDirection: 'row', alignItems: 'center' },
})

export const ReportBanner = ({
  title,
  titleFontSize = 30,
}: {
  title: string
  titleFontSize?: number
}) => (
  <View style={chromeStyles.banner}>
    <Text style={[chromeStyles.bannerTitle, { fontSize: titleFontSize }]}>{title}</Text>
    <View style={chromeStyles.bannerBrand}>
      <Image src='/icon.png' style={chromeStyles.bannerLogo} />
      <View>
        <Text style={chromeStyles.bannerBrandText}>NORTHERN VOICES</Text>
        <Text style={chromeStyles.bannerBrandSub}>SPEECH SERVICES</Text>
      </View>
    </View>
  </View>
)

export const ReportFooter = ({
  page,
  of,
  brand,
}: {
  page?: number
  of?: number
  brand: string
}) => (
  <View style={chromeStyles.footer} fixed>
    <Text>{brand}</Text>
    <View style={chromeStyles.footerPage}>
      <Image src='/icon.png' style={chromeStyles.footerLogo} />
      {page !== undefined && of !== undefined ? (
        <Text>{`${page} of ${of}`}</Text>
      ) : (
        <Text render={({ pageNumber, totalPages }) => `${pageNumber} of ${totalPages}`} />
      )}
    </View>
  </View>
)
