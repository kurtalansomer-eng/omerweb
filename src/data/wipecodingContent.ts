export interface FormulaPreset {
  id: string;
  label: string;
  studentContext: string;
  rol: string;
  gorev: string;
  prompt: string;
}

export interface StudentScenario {
  number: string;
  title: string;
  oldWay: string;
  wipeWay: string;
  timeSaved: string;
}

export interface SecurityMeasure {
  number: string;
  title: string;
  layer: string;
  summary: string;
  technicalDetail: string;
}

export interface PerformanceMeasure {
  number: string;
  title: string;
  impact: string;
  summary: string;
}

export const FORMULA_PRESETS: FormulaPreset[] = [
  {
    id: 'club-site',
    label: 'Bölüm Kulübü Sitesi',
    studentContext: 'Mühendislik veya tasarım kulübü tanıtım sayfası',
    rol: 'Sen üniversite teknoloji kulüpleri için sade, hızlı ve erişilebilir arayüzler kuran kıdemli bir web tasarımcısısın.',
    gorev: 'Kulübümüzün haftalık atölye takvimini, proje arşivini ve yeni üye başvuru formunu gösteren tek sayfalık bir web sitesi tasarla.',
    prompt:
      'Açık gri ve kobalt mavisi renk paleti kullan, mobil ekranlarda tek sütuna düşsün, form alanlarında e-posta doğrulaması yap ve gereksiz ağır animasyonlardan kaçın.',
  },
  {
    id: 'exam-planner',
    label: 'Vize Çalışma Planlayıcısı',
    studentContext: 'Sınav haftasında konu ve süre takibi',
    rol: 'Sen öğrenci üretkenliği üzerine çalışan, bilişsel yükü azaltan dijital araçlar geliştiren bir ürün mühendisisin.',
    gorev: 'Öğrencilerin ders konularını zorluk derecesine göre sıralayıp günlük 45 dakikalık çalışma bloklarına bölen etkileşimli bir planlayıcı oluştur.',
    prompt:
      'Verileri tarayıcıda güvenli biçimde sakla, kafa karıştıran grafikler yerine net bir tablo ve ilerleme çubuğu göster, klavye ile hızlı veri girişine izin ver.',
  },
  {
    id: 'portfolio',
    label: 'Staj Portfolyosu',
    studentContext: 'Yaz stajı başvurularında öne çıkmak için',
    rol: 'Sen yazılım ve tasarım stajyerlerinin başvurularını inceleyen, netlik ve hız odaklı bir teknik işe alım danışmanı ve frontend geliştiricisisin.',
    gorev: 'Üç ders projemi, kullandığım araçları ve staj iletişim bilgilerimi sergileyen temiz bir kişisel portfolyo sayfası hazırla.',
    prompt:
      'Abartılı efektler veya sahte puan göstergeleri koyma, her proje için problemi ve çözümü ikişer cümlede anlat, sayfa 1 saniyenin altında açılsın.',
  },
  {
    id: 'lab-report',
    label: 'Lab Verisi Görselleştirici',
    studentContext: 'Fizik / kimya / istatistik ödev sunumu',
    rol: 'Sen bilimsel verileri anlaşılır eğitim araçlarına dönüştüren bir veri görselleştirme uzmanısın.',
    gorev: 'Öğrencinin girdiği deney ölçümlerini tablo halinde doğrulayıp ortalamasını ve sapmasını hesaplayan etkileşimli bir araç yaz.',
    prompt:
      'Sayısal sütunlarda hizalı rakamlar kullan, hatalı metin girişlerini anında uyar, sadece gerekli bileşenleri yeniden çizerek donmayı engelle.',
  },
];

export const STUDENT_SCENARIOS: StudentScenario[] = [
  {
    number: '01',
    title: 'Dönem Ödevleri ve Sunum Prototipleri',
    oldWay: 'CSS hizalama hatalarıyla 4 saat boğuşup fikri anlatmaya vakit kalmaması.',
    wipeWay: 'Önce problemi ve kullanıcı akışını yazarak 30 dakikada çalışan canlı prototip çıkarmak.',
    timeSaved: '4 saatten 35 dakikaya',
  },
  {
    number: '02',
    title: 'Öğrenci Kulübü ve Kampüs Etkinlikleri',
    oldWay: 'Hazır şablonlarda kaybolup etkinlik tarihine kadar sitenin yetişmemesi.',
    wipeWay: 'Rol, görev ve tasarım kısıtlarını vererek kulübün kimliğine özel hızlı bir sayfa kurmak.',
    timeSaved: '2 haftadan 1 akşama',
  },
  {
    number: '03',
    title: 'Staj Başvuruları ve Kişisel Vitrin',
    oldWay: 'Sadece PDF özgeçmiş gönderip projeleri görsel olarak kanıtlayamamak.',
    wipeWay: 'Projelerini gerçek etkileşimli demolarla sunarak teknik ekibe doğrudan işini göstermek.',
    timeSaved: 'Tek günde yayında',
  },
];

export const SECURITY_MEASURES: SecurityMeasure[] = [
  {
    number: '01',
    title: 'Kayan Pencere Hız Sınırlama (Rate Limiting)',
    layer: 'Sunucu Giriş Katmanı',
    summary:
      'Aynı IP adresinden gelen istekler hem 60 saniyelik genel pencerede hem de 4 saniyelik ani taşkın penceresinde sayılır.',
    technicalDetail:
      'API uç noktalarında dakikada 20, 4 saniyede en fazla 4 istek sınırı bulunur; aşımında otomatik bekleme uygulanır.',
  },
  {
    number: '02',
    title: 'Slowloris ve Yavaş Bağlantı Koruması',
    layer: 'HTTP Soket Katmanı',
    summary:
      'Saldırganların bağlantıyı açık tutup sunucu kaynaklarını tüketmesini önlemek için başlık ve istek zaman aşımları kısaltılır.',
    technicalDetail:
      'headersTimeout 5 sn, requestTimeout 10 sn ve keepAliveTimeout 5 sn ile kilitlenen soketler anında kapatılır.',
  },
  {
    number: '03',
    title: '16 KB Gövde Sınırı ve Sınırlı Bellek Tablosu',
    layer: 'İstek Ayrıştırma Katmanı',
    summary:
      'Dev JSON paketleriyle RAM şişirmeyi engellemek için veri boyutu 16 KB ile kısıtlanır ve IP takip tablosu 5.000 kayıtla sınırlanır.',
    technicalDetail:
      'Sınırı aşan paketler 413 Payload Too Large koduyla reddedilir; eski IP kayıtları bellekten temizlenir.',
  },
  {
    number: '04',
    title: 'İstemci Soğutma, CSP ve Eşzamanlılık Kilidi',
    layer: 'Uygulama ve Tarayıcı Katmanı',
    summary:
      'Form doğrulama ve güvenlik başlıkları (CSP, nosniff) XSS riskini kapatırken eşzamanlı 32 istek üstü geri basınçla korunur.',
    technicalDetail:
      'Butonlarda istemci tarafı gecikme kilidi (cooldown) bulunur; kullanıcı spam tıklasa bile sunucu boğulmaz.',
  },
];

export const PERFORMANCE_MEASURES: PerformanceMeasure[] = [
  {
    number: '01',
    title: 'GPU Yüklemeyen Statik Mimari Arka Plan',
    impact: 'Sıfır Sürekli CPU/GPU Tüketimi',
    summary:
      'Ekranda sürekli dönen ağır 3D partiküller veya dev bulanık (blur) katmanlar yerine saf CSS ızgara dokusu kullanılır; dizüstü bilgisayar fanını yormaz.',
  },
  {
    number: '02',
    title: 'Görünmeyen Alanlarda Ertelenmiş Çizim (content-visibility)',
    impact: 'İlk Açılışta %40 Daha Az Çizim İşi',
    summary:
      'Alt bölümler yalnızca kullanıcı sayfayı aşağı kaydırdıkça tarayıcı tarafından işlenir; ilk yüklemede takılma yaşanmaz.',
  },
  {
    number: '03',
    title: 'Yalnızca Transform ve Opacity Animasyonları',
    impact: '60 FPS Akıcı Kaydırma',
    summary:
      'Genişlik, yükseklik veya kenar boşluğu gibi sayfa düzenini bozan özellikler animasyona sokulmaz; hareket azaltma tercihi olan cihazlara saygı duyulur.',
  },
  {
    number: '04',
    title: 'Bölünmüş Durum Yönetimi ve İstek Tekilleştirme',
    impact: 'Donmayan Form Deneyimi',
    summary:
      'Formül stüdyosunda yazı yazarken yalnızca ilgili kutu güncellenir, önceki tamamlanmamış ağ istekleri iptal edilerek arayüz akıcı tutulur.',
  },
];
