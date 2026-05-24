import Image from "next/image";

const MAP_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBMjVliinRJ-Dn1awBflZrqWxEqQ4KW0YwGDkoiZe_PJYDvUkUsauAe5KOF20cfXnvVxSLTvOr1nH-h3pDCN2UYjzL1m2V9xB_vke78FnjFfhFoPsl1V7AjiFBg-9QtR7mkujNs2xOkt_6fG0owSMbR40VNNTLAH8ru2lMC_is89rZ4-Lqz00JCZnLOlUz-J9tuF7eZSkCaIsob0ekoGx68gsteGqNxybM7iL4DG8nJ_LjmEkJyquQi_OEKkue6kusEgak4-c-f-bk";

export function MapBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <Image
        src={MAP_IMAGE}
        alt="Bangalore city aerial view"
        fill
        className="object-cover"
        priority
        sizes="100vw"
        unoptimized
      />
      <div className="absolute inset-0 map-gradient-overlay pointer-events-none" />
    </div>
  );
}
