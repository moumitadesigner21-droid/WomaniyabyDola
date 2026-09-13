import { AddressBook } from "@/components/account/address-book";

export const metadata = { title: "Saved addresses" };

export default function AccountAddressesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] tracking-[0.28em] text-gold uppercase">My account</p>
        <h1 className="mt-2 font-serif text-3xl text-maroon sm:text-4xl">Addresses</h1>
        <p className="mt-2 text-sm text-warm-gray">Your default address is pre-filled at checkout.</p>
      </div>
      <AddressBook />
    </div>
  );
}
