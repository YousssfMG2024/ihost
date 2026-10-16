# iHost Panel v4

نظام استضافة خفيف مبني من جديد باسم iHost وبألوان الشعار الأحمر/الأبيض والأسود.

## ما تم إصلاحه
- المستخدم العادي يستطيع التسجيل وإنشاء خادم واحد فقط.
- فصل صارم للخوادم حسب `ownerUserId` لمنع ظهور خادم مستخدم لحساب آخر.
- خطط Discord وMinecraft كما طلبت.
- Plus يمكن منحه من لوحة الإدارة.
- المنفذ والعنوان يتم توليدهما تلقائياً من الـ Node، ولا يطلبان من المستخدم.
- Scheduler يختار Node لديها RAM/CPU/Disk كافية.
- دعم Main Node + Remote Nodes عبر iHost Node Agent بدلاً من إعطاء لوحة التحكم Docker socket للنودات البعيدة.
- Owner/Admin بصلاحيات واضحة، والـ Admin لا يستطيع ترقية نفسه أو تعديل Owner/Admin.
- زر Keep Alive يومي؛ إذا لم يتم تجديد النشاط لمدة 5 أيام يتم حذف الخادم تلقائياً.
- الخادم المتوقف بالكامل 5 أيام يتم حذفه أيضاً.
- عربي/English من داخل الواجهة.
- Security: لا يوجد JWT secret افتراضي في الإنتاج، ولا يقبل إنشاء الخادم `owner` من العميل للمستخدم العادي.

## الخطط
### Discord
- Free: 50% CPU / 2GB RAM / 5GB Disk
- Plus: 75% CPU / 4GB RAM / 13GB Disk
### Minecraft
- Free: 100% CPU / 3GB RAM / 10GB Disk
- Plus: 200% CPU / 6GB RAM / 15GB Disk

## تشغيل لوحة التحكم
1. انسخ `.env.example` إلى `.env` وعدّل القيم.
2. `npm install`
3. `npm run build`
4. `npm start`

## تشغيل Node Agent على كل VPS
1. انسخ المشروع إلى الـ VPS.
2. شغل Docker.
3. أنشئ ملف `.env.agent`:
   - `AGENT_PORT=8787`
   - `AGENT_SECRET=نفس السر الموجود في Node داخل لوحة التحكم`
   - `NODE_ID=node-2`
   - `NODE_NAME=VPS 2`
   - `NODE_ADDRESS=IP_OR_DOMAIN`
   - `NODE_RAM_MB=16384`
   - `NODE_DISK_GB=200`
   - `NODE_CPU_PERCENT=800`
4. `npm install && npm run build && npm run start:agent`
5. أضف الـ Node من لوحة Admin.

> العنوان العام للخادم والمنفذ لا يكتبهما المستخدم. الـ Scheduler يختار Node والمنفذ تلقائياً.

## ملاحظة الإنتاج
التخزين الحالي JSON ذري ومقفل داخل عملية لوحة واحدة. هو مناسب للـ MVP/استضافة صغيرة. عند التوسع الكبير يُنصح بترحيله إلى PostgreSQL/Redis مع نفس طبقة Repository.

## صلاحيات iHost
- **Owner:** كل شيء، بما في ذلك إضافة/حذف Nodes، إدارة Admins، منح Plus، وإدارة كل الخوادم.
- **Admin:** إدارة الخوادم، المستخدمين العاديين، ومنح/إزالة Plus. لا يستطيع تعديل Owner أو Admin آخر ولا حذف Node.
- **User:** تسجيل/دخول، إنشاء خادم واحد، إدارة خادمه، والضغط على Keep Alive.

## الشبكة
- لا تفتح Agent `8787` للعالم بدون Firewall. الأفضل السماح فقط بعنوان IP الخاص بالـ Panel.
- لا تستخدم Docker socket على شبكة عامة.
- ضع Reverse Proxy + HTTPS أمام Panel في الإنتاج.
