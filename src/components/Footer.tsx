export default function Footer() {
  return (
    <footer className="w-full py-12 bg-primary text-white mt-auto">
      <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-3xl font-bold font-sans mb-4">Dr.Berry</h3>
          <p className="text-white/80 leading-relaxed">
            Medical Cosmetic Products. <br />
            عناية طبية فائقة لبشرتك وشعرك.
          </p>
        </div>
        <div>
          <h4 className="text-xl font-bold mb-4 text-secondary">روابط سريعة</h4>
          <ul className="space-y-2 text-white/80">
            <li className="cursor-pointer hover:text-secondary transition-colors">الرئيسية</li>
            <li className="cursor-pointer hover:text-secondary transition-colors">المنتجات</li>
            <li className="cursor-pointer hover:text-secondary transition-colors">تتبع الطلب</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xl font-bold mb-4 text-secondary">تواصل معنا</h4>
          <p className="text-white/80">
            يسعدنا الرد على استفساراتكم ومساعدتكم لاختيار المنتج الأنسب لك.
          </p>
        </div>
      </div>
    </footer>
  );
}
