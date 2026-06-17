import { useEffect, useState } from "react";
import { Document, Image, Page, PDFViewer, Text, View } from "@react-pdf/renderer";
import { useParams } from "react-router-dom";

import AppSpinner from "@/components/app-components/app-spinner/AppSpinner";
import { TransactionService } from "@/helpers/services/TransactionService";
import type { TransactionPrintData } from "@/interfaces/ITransactionService";
import { styles } from "./TransactionPrintPage.constant";

const formatLongDate = (value?: string | null) => {
    if (!value) {
        return "-";
    }

    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(value));
};

const TransactionPrintDocument = ({ data }: { data: TransactionPrintData }) => {
    return (
        <Document title={`Surat Jalan${" - " + data.sellingNumber}`}>
            <Page size={{ width: 595.28, height: 420.94 }} style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.companyBlock}>
                        <View style={styles.companyHeader}>
                            <Image src="/assets/img/favicon.png" style={styles.companyLogo} />
                            <View style={styles.companyInfo}>
                                <Text style={styles.companyTitle}>PT. LANGGAN PUTRA GUNA</Text>
                                <Text>JL.A.R. Hakim No. 11. Tegal</Text>
                                <Text>Telp. (0283) 353.895 : 3305940</Text>
                                <Text>Facs. (0283) 356 183</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.topRightBlock}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Penjualan</Text>
                            <Text>: </Text>
                            <Text style={styles.value}>{data.sellingType || "-"}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>No.</Text>
                            <Text>: </Text>
                            <Text style={styles.value}>{data.sellingNumber ?? "-"}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Nama</Text>
                            <Text>: </Text>
                            <Text style={styles.value}>{data.name || "-"}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Alamat</Text>
                            <Text>: </Text>
                            <Text style={styles.value}>{data.address || "-"}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>No. Telp/HP</Text>
                            <Text>: </Text>
                            <Text style={styles.value}>{data.phone || "-"}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.title}>SURAT JALAN</Text>

                <View style={styles.content}>
                    <View style={styles.leftContent}>
                        <Text style={styles.vehicleIntro}>1 (satu) buah kendaraan bermotor :</Text>

                        <View style={styles.vehicleRow}>
                            <Text style={styles.vehicleLabel}>Type</Text>
                            <Text style={styles.vehicleColon}>:</Text>
                            <Text style={styles.vehicleValue}>{data.typeName || "-"}</Text>
                        </View>
                        <View style={styles.vehicleRow}>
                            <Text style={styles.vehicleLabel}>Deskripsi</Text>
                            <Text style={styles.vehicleColon}>:</Text>
                            <Text style={styles.vehicleValue}>{data.typeDescription + " (" + data.typeCode + ")" || "-"}</Text>
                        </View>
                        <View style={styles.vehicleRow}>
                            <Text style={styles.vehicleLabel}>Warna</Text>
                            <Text style={styles.vehicleColon}>:</Text>
                            <Text style={styles.vehicleValue}>{data.colorName || "-"}</Text>
                        </View>
                        <View style={styles.vehicleRow}>
                            <Text style={styles.vehicleLabel}>Tahun</Text>
                            <Text style={styles.vehicleColon}>:</Text>
                            <Text style={styles.vehicleValue}>{data.year || "-"}</Text>
                        </View>
                        <View style={styles.vehicleRow}>
                            <Text style={styles.vehicleLabel}>Volume</Text>
                            <Text style={styles.vehicleColon}>:</Text>
                            <Text style={styles.vehicleValue}>{data.volume ? `${data.volume} cc` : "-"}</Text>
                        </View>
                        <View style={styles.vehicleRow}>
                            <Text style={styles.vehicleLabel}>No. Rangka</Text>
                            <Text style={styles.vehicleColon}>:</Text>
                            <Text style={styles.vehicleValue}>{data.noRangka || "-"}</Text>
                        </View>
                        <View style={styles.vehicleRow}>
                            <Text style={styles.vehicleLabel}>No. Mesin</Text>
                            <Text style={styles.vehicleColon}>:</Text>
                            <Text style={styles.vehicleValue}>{data.noMesin || "-"}</Text>
                        </View>
                        <View style={styles.vehicleRow}>
                            <Text style={styles.vehicleLabel}>Keterangan</Text>
                            <Text style={styles.vehicleColon}>:</Text>
                            <Text style={styles.vehicleValue}>{"_________________________"}</Text>
                        </View>
                        <View style={styles.vehicleRow}>
                            <Text style={styles.vehicleLabel}></Text>
                            <Text style={styles.vehicleColon}></Text>
                            <Text style={styles.vehicleValue}>{"_________________________"}</Text>
                        </View>
                        <View style={styles.vehicleRow}>
                            <Text style={styles.vehicleLabel}></Text>
                            <Text style={styles.vehicleColon}></Text>
                            <Text style={styles.vehicleValue}>{"_________________________"}</Text>
                        </View>
                    </View>

                    <View style={styles.rightContent}>
                        <Text style={styles.notesTitle}>SYARAT / KETERANGAN :</Text>
                        <View style={styles.noteItem}><Text style={styles.noteNumber}>1</Text><Text style={styles.noteText}>Kendaraan 100% baru lengkap dengan perkakas.</Text></View>
                        <View style={styles.noteItem}><Text style={styles.noteNumber}>2</Text><Text style={styles.noteText}>Buku Pedoman, Buku Service, Helm & Jaket.</Text></View>
                        <View style={styles.noteItem}><Text style={styles.noteNumber}>3</Text><Text style={styles.noteText}>Peraturan-peraturan Pemerintah yang dikeluarkan sesudah tanggal dibuat Surat Jalan ini menjadi beban tanggungan pembeli.</Text></View>
                        <View style={styles.noteItem}><Text style={styles.noteNumber}>4</Text><Text style={styles.noteText}>Barang-barang yang telah keluar dari toko/gudang kami, tidak dapat dikembalikan.</Text></View>
                        <View style={styles.noteItem}><Text style={styles.noteNumber}>5</Text><Text style={styles.noteText}>Bila Faktur asli tidak diambil dalam waktu 1 bulan, maka segala akibat dan semua hal-hal yang tidak diinginkan yang mungkin akan menimpa pihak importir menjadi beban pembeli sepenuhnya.</Text></View>
                        <View style={styles.noteItem}><Text style={styles.noteNumber}>6</Text><Text style={styles.noteText}>Surat jalan ini tidak dapat dipindahtangankan/diperjual belikan.</Text></View>
                    </View>
                </View>

                <View style={styles.footerLine} />

                <View style={styles.footer}>
                    <View style={styles.signatureBlock}>
                        <Text>Tegal, {formatLongDate(data.dateOUT)}</Text>
                        <Text>Diserahkan oleh,</Text>
                        <View>
                            <Text style={styles.signature}>(_________________________)</Text>
                        </View>
                    </View>

                    <View style={styles.signatureBlock}>
                        <Text>Diterima, Dibaca dan Disetujui,</Text>
                        <Text>Pembeli,</Text>
                        <View>
                            <Text style={styles.signature}>(_________________________)</Text>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

const TransactionPrintPage = () => {
    const { transactionId } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [printData, setPrintData] = useState<TransactionPrintData | null>(null);

    useEffect(() => {
        const parsedTransactionId = Number(transactionId);

        if (!Number.isInteger(parsedTransactionId) || parsedTransactionId <= 0) {
            setErrorMessage("Invalid transaction id.");
            setIsLoading(false);
            return;
        }

        void TransactionService.getTransactionPrintDataByTransactionId({
            transactionId: parsedTransactionId,
            setIsLoading,
        })
            .then((response) => {
                if (!response.data) {
                    setErrorMessage("Transaction print data not found.");
                    return;
                }

                setPrintData(response.data);
            })
            .catch((error) => {
                setErrorMessage(error.error.message);
            });
    }, [transactionId]);

    if (isLoading) {
        return <AppSpinner />;
    }

    if (errorMessage || !printData) {
        return (
            <div className="flex min-h-screen items-center justify-center p-6 text-center text-sm text-muted-foreground">
                {"Transaction print data not found." + "(" + errorMessage + ")"}
            </div>
        );
    }

    return (
        <PDFViewer style={styles.viewer} showToolbar>
            <TransactionPrintDocument data={printData} />
        </PDFViewer>
    );
};

export default TransactionPrintPage;