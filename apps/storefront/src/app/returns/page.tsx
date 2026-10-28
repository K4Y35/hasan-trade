import Link from 'next/link';

export default function ReturnsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-3xl font-semibold">Return and exchange</h1>
      <p className="mt-5 leading-relaxed text-slate-600">
        Unused products in original packaging may be exchanged within 7 days of delivery if the seal is intact and the
        serial number matches the invoice. Opened refrigerators, ACs and installed electronics are covered by warranty,
        not return.
      </p>
      <p className="mt-4 leading-relaxed text-slate-600">
        To check cover or open a claim, use the serial on the unit and the phone number given at purchase.
      </p>
      <p className="mt-6">
        <Link href="/warranty" className="btn-primary">
          Check warranty / file a claim
        </Link>
      </p>
      <p className="mt-6 leading-relaxed text-slate-600">
        Call +8801711166522 with your order number before sending any item back to the Sylhet showroom.
      </p>
    </main>
  );
}
