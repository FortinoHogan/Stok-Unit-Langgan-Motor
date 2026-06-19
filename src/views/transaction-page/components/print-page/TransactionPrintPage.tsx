import { useEffect, useState } from "react";
import { Document, Image, Page, PDFViewer, Text, View } from "@react-pdf/renderer";
import { useParams } from "react-router-dom";

import AppSpinner from "@/components/app-components/app-spinner/AppSpinner";
import { TransactionService } from "@/helpers/services/TransactionService";
import type { TransactionPrintData } from "@/interfaces/ITransactionService";
import { styles } from "./TransactionPrintPage.constant";
import AppAutoComplete from "@/components/app-components/app-auto-complete/AppAutoComplete";
import type { AutoCompleteOption } from "@/components/app-components/app-auto-complete/AppAutoComplete.interface";
import AppModal from "@/components/app-components/app-modal/AppModal";
import { Button } from "@/components/ui/button";
import { ProgramService } from "@/helpers/services/ProgramService";
import { PeriodService } from "@/helpers/services/PeriodService";
import { SalesService } from "@/helpers/services/SalesService";
import { formatLongDate } from "@/lib/utils";
import AppCheckboxList from "@/components/app-layout/app-checkbox-list/AppCheckboxList";

const mmToPt = (mm: number) => mm * 2.83464567;

const buyerInfoRows = (data: TransactionPrintData) => (
    <>
        <View style={styles.secondBuyerRow}>
            <Text style={styles.secondBuyerLabel}>Nama</Text>
            <Text style={styles.secondBuyerColon}>:</Text>
            <Text style={styles.secondBuyerValue}>{data.name || "-"}</Text>
        </View>
        <View style={styles.secondBuyerRow}>
            <Text style={styles.secondBuyerLabel}>Alamat</Text>
            <Text style={styles.secondBuyerColon}>:</Text>
            <Text style={styles.secondBuyerValue}>{data.address || "-"}</Text>
        </View>
        <View style={styles.secondBuyerRow}>
            <Text style={styles.secondBuyerLabel}>No. Telp.</Text>
            <Text style={styles.secondBuyerColon}>:</Text>
            <Text style={styles.secondBuyerValue}>{data.phone || "-"}</Text>
        </View>
        <View style={styles.secondBuyerDateRow}>
            <Text style={styles.secondBuyerLabel}>Tgl. Beli</Text>
            <Text style={styles.secondBuyerColon}>:</Text>
            <Text style={styles.secondBuyerDateValue}>{formatLongDate(data.dateOUT)}</Text>
        </View>
        <View style={styles.secondBuyerRow}>
            <Text style={styles.secondBuyerLabel}>Nama</Text>
            <Text style={styles.secondBuyerColon}>:</Text>
            <Text style={styles.secondBuyerValue}>{data.name || "-"}</Text>
        </View>
        <View style={styles.secondBuyerRow}>
            <Text style={styles.secondBuyerLabel}>Alamat</Text>
            <Text style={styles.secondBuyerColon}>:</Text>
            <Text style={styles.secondBuyerValue}>{data.address || "-"}</Text>
        </View>
        <View style={styles.secondBuyerRow}>
            <Text style={styles.secondBuyerLabel}>No. Telp.</Text>
            <Text style={styles.secondBuyerColon}>:</Text>
            <Text style={styles.secondBuyerValue}>{data.phone || "-"}</Text>
        </View>
        <View style={styles.secondBuyerDateRow}>
            <Text style={styles.secondBuyerLabel}>Tgl. Beli</Text>
            <Text style={styles.secondBuyerColon}>:</Text>
            <Text style={styles.secondBuyerDateValue}>{formatLongDate(data.dateOUT)}</Text>
        </View>
    </>
);

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
                            <Text style={styles.value}>{data.sellingTypeName || "-"}</Text>
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

            <Page
                size={{
                    width: mmToPt(76),
                    height: mmToPt(38),
                }}
                style={styles.secondPage}
            >
                <View style={styles.secondCard}>
                    <View style={styles.secondBuyerGroup}>{buyerInfoRows(data)}</View>
                </View>
            </Page>

            <Page size={{ width: 595.28, height: 420.94 }} style={styles.thirdPage}>
                {data?.programName?.map((programName, index) => <View style={styles.thirdCard} key={index}>
                    <View style={styles.thirdHeaderBox}>
                        <Text style={styles.thirdTitle}>BAST HADIAH</Text>
                        <View style={styles.thirdHeaderDivider} />
                        <Text style={styles.thirdSubTitle}>{programName}</Text>
                        <Text style={styles.thirdPeriod}>{data.period}</Text>
                    </View>

                    <View style={styles.thirdBody}>
                        <Text>Data Konsumen :</Text>
                        <View style={styles.thirdInfoRows}>
                            <View style={styles.thirdInfoRow}>
                                <Text style={styles.thirdInfoLabel}>Nama</Text>
                                <Text style={styles.thirdInfoColon}>:</Text>
                                <Text style={styles.thirdInfoValue}>{data.name || "-"}</Text>
                            </View>
                            <View style={styles.thirdInfoRow}>
                                <Text style={styles.thirdInfoLabel}>Alamat</Text>
                                <Text style={styles.thirdInfoColon}>:</Text>
                                <Text style={styles.thirdInfoValue}>{data.address || "-"}</Text>
                            </View>
                            <View style={styles.thirdInfoRow}>
                                <Text style={styles.thirdInfoLabel}>No. Telp</Text>
                                <Text style={styles.thirdInfoColon}>:</Text>
                                <Text style={styles.thirdInfoValue}>{data.phone || "-"}</Text>
                            </View>
                        </View>

                        <Text style={styles.thirdStatement}>Menyatakan telah terima dari Dealer HADIAH berupa :</Text>
                        <Text style={styles.thirdGiftLine}>{`> 1 Unit ${programName}`}</Text>
                    </View>

                    <View style={styles.thirdSignatures}>
                        <View style={styles.thirdSignatureBlock}>
                            <Text style={styles.thirdDate}> </Text>
                            <Text style={styles.thirdDate}>Diterima oleh KONSUMEN,</Text>
                            <Text style={styles.thirdSignatureGap}> </Text>
                            <Text style={styles.thirdSignatureName}>{data.name || "-"}</Text>
                        </View>

                        <View style={styles.thirdSignatureBlock}>
                            <Text style={styles.thirdDate}>Tegal, {formatLongDate(data.dateOUT)}</Text>
                            <Text style={styles.thirdDate}>Diserahkan oleh SALESMAN,</Text>
                            <Text style={styles.thirdSignatureGap}> </Text>
                            <Text style={styles.thirdSignatureName}>{data.salesName || "SALESMAN"}</Text>
                        </View>
                    </View>
                </View>)}
            </Page>

            <Page size={{ width: 595.28, height: 420.94 }} style={styles.fourthPage}>
                <View style={styles.fourthHeader}>
                    <View style={styles.fourthCompanyBlock}>
                        <Image src="/assets/img/favicon.png" style={styles.companyLogo} />

                        <View style={styles.fourthCompanyInfo}>
                            <Text style={styles.fourthCompanyName}>
                                PT. LANGGAN PUTRA GUNA
                            </Text>
                            <Text>JL.A.R. Hakim No. 11. Tegal</Text>
                            <Text>Telp. (0283) 353.895 : 3305940</Text>
                            <Text>Facs. (0283) 356 183</Text>
                        </View>
                    </View>

                    <Text style={styles.fourthDocumentNo}>
                        {data.sellingNumber}
                    </Text>
                </View>

                <Text style={styles.fourthTitle}>
                    TANDA TERIMA UNIT DAN PERLENGKAPANNYA
                </Text>

                <View style={styles.fourthSection}>
                    <Text>
                        Sudah terima 1 (satu) unit sepeda motor Honda dengan data sebagai berikut :
                    </Text>
                </View>

                <View style={styles.fourthVehicleRow}>
                    <Text style={styles.fourthVehicleLabel}>Type Motor</Text>
                    <Text style={styles.fourthVehicleColon}>:</Text>
                    <Text style={styles.fourthVehicleValue}>{data.typeName}</Text>

                    <Text style={styles.fourthVehicleLabel}>Warna</Text>
                    <Text style={styles.fourthVehicleColon}>:</Text>
                    <Text style={styles.fourthVehicleValue}>{data.colorName}</Text>
                </View>

                <View style={styles.fourthVehicleRow}>
                    <Text style={styles.fourthVehicleLabel}>No. Rangka</Text>
                    <Text style={styles.fourthVehicleColon}>:</Text>
                    <Text style={styles.fourthVehicleValue}>{data.noRangka}</Text>

                    <Text style={styles.fourthVehicleLabel}>No. Mesin</Text>
                    <Text style={styles.fourthVehicleColon}>:</Text>
                    <Text style={styles.fourthVehicleValue}>{data.noMesin}</Text>
                </View>

                <View style={styles.fourthVehicleRow}>
                    <Text style={styles.fourthVehicleLabel}>Unit Atas Nama</Text>
                    <Text style={styles.fourthVehicleColon}>:</Text>
                    <Text style={styles.fourthVehicleValue}>{data.name}</Text>

                    <Text style={styles.fourthVehicleLabel}>Tahun</Text>
                    <Text style={styles.fourthVehicleColon}>:</Text>
                    <Text style={styles.fourthVehicleValue}>{data.year}</Text>
                </View>

                <Text>
                    Kendaraan diserahkan lengkap dengan perakas sebagai berikut :
                </Text>

                <View style={styles.fourthEquipmentTable}>
                    {[
                        ["1 (satu) buah Helm", "2 (dua) set kunci kontak", "1 (satu) buah buku servis"],
                        ["1 (satu) set toolkit", "1 (satu) buah jaket", "1 (satu) buah buku pedoman"],
                        ["1 (satu) Lbr Asuransi", "1 (satu) Lbr Kartu Apresiasi LPG", "1 (satu) safety tool"],
                        [null, null, " "],
                    ].map((row, index) => (
                        <View key={index} style={styles.fourthEquipmentRow}>
                            {row.map((item, cellIndex) =>
                                item ? (
                                    <View key={cellIndex} style={styles.fourthEquipmentCell}>
                                        <Text style={styles.fourthCheckBox}>X</Text>
                                        <Text style={styles.fourthEquipmentText}>{item}</Text>
                                    </View>
                                ) : (
                                    <View
                                        key={cellIndex}
                                        style={{
                                            width: "33.33%",
                                        }}
                                    />
                                )
                            )}
                        </View>
                    ))}
                </View>

                <Text>
                    Tegal, {formatLongDate(data.dateOUT)}
                </Text>

                <View style={styles.fourthSignatureSection}>
                    <View style={styles.signatureBlock}>
                        <Text>Diserahkan oleh,</Text>
                        <View>
                            <Text style={styles.signature}>(_________________________)</Text>
                        </View>
                    </View>
                    <View style={styles.signatureBlock}>
                        <Text>Diterima oleh,</Text>
                        <View>
                            <Text style={styles.signature}>(_________________________)</Text>
                        </View>
                    </View>

                    <View style={styles.fourthNotesBlock}>
                        <Text style={styles.fourthNotesTitle}>Catatan :</Text>
                        <Text style={styles.fourthNotesText}>
                            Lembar putih, ke perusahaan
                        </Text>
                        <Text style={styles.fourthNotesText}>
                            Lembar merah, ke konsumen
                        </Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

const TransactionPrintPage = () => {
    const { transactionId } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState("");
    const [printData, setPrintData] = useState<TransactionPrintData | null>(null);
    const [programOptions, setProgramOptions] = useState<AutoCompleteOption[]>([]);
    const [periodOptions, setPeriodOptions] = useState<AutoCompleteOption[]>([]);
    const [salesOptions, setSalesOptions] = useState<AutoCompleteOption[]>([]);
    const [isLoadingProgramOptions, setIsLoadingProgramOptions] = useState(false);
    const [isLoadingPeriodOptions, setIsLoadingPeriodOptions] = useState(false);
    const [isLoadingSalesOptions, setIsLoadingSalesOptions] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState<string[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<string>("");
    const [selectedSales, setSelectedSales] = useState<string>("");
    const [isShowStatus, setIsShowStatus] = useState(false);

    const fetchPrintData = async () => {
        const parsedTransactionId = Number(transactionId);

        if (!Number.isInteger(parsedTransactionId) || parsedTransactionId <= 0) {
            setStatusMessage("Invalid transaction id.");
            setIsShowStatus(true);
            setIsLoading(false);
            return;
        }

        await TransactionService.getTransactionPrintDataByTransactionId({
            transactionId: parsedTransactionId,
            setIsLoading,
        })
            .then((response) => {
                if (!response.data) {
                    setStatusMessage("Transaction print data not found.");
                    setIsShowStatus(true);
                    return;
                }

                setPrintData(response.data);
            })
            .catch((error) => {
                setStatusMessage(error.error.message);
                setIsShowStatus(true);
            });
    }

    const fetchProgramOptions = async () => {
        await ProgramService.getProgramList({ setIsLoading: setIsLoadingProgramOptions, page: 1, pageSize: 9999 })
            .then((res) => {
                const options: AutoCompleteOption[] = res.data?.map((item) => ({
                    value: item.programId.toString(),
                    label: item.programName,
                })) || [];
                setSelectedProgram(options[0]?.value ? [options[0].value] : []);
                setProgramOptions(options);
            })
            .catch((error) => {
                setStatusMessage("Failed to fetch program options: " + error.error.message);
                setIsShowStatus(true);
            });
    };

    const fetchPeriodOptions = async () => {
        await PeriodService.getPeriodList({ setIsLoading: setIsLoadingPeriodOptions, page: 1, pageSize: 9999 })
            .then((res) => {
                const options: AutoCompleteOption[] = res.data?.map((item) => ({
                    value: item.periodId.toString(),
                    label: formatLongDate(item.startDate) + " - " + formatLongDate(item.endDate),
                })) || [];
                setSelectedPeriod(res.data?.find((item) => item.isDefault === true)?.periodId.toString() || "");
                setPeriodOptions(options);
            })
            .catch((error) => {
                setStatusMessage("Failed to fetch period options: " + error.error.message);
                setIsShowStatus(true);
            });
    };

    const fetchSalesOptions = async () => {
        await SalesService.getSalesList({ setIsLoading: setIsLoadingSalesOptions, page: 1, pageSize: 9999 })
            .then((res) => {
                const options: AutoCompleteOption[] = res.data?.map((item) => ({
                    value: item.salesId.toString(),
                    label: item.salesName,
                })) || [];
                setSelectedSales(options[0]?.value || "");
                setSalesOptions(options);
            })
            .catch((error) => {
                setStatusMessage("Failed to fetch sales options: " + error.error.message);
                setIsShowStatus(true);
            });
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchPrintData();
            await fetchProgramOptions();
            await fetchPeriodOptions();
            await fetchSalesOptions();
        };

        fetchData();
    }, [transactionId]);

    useEffect(() => {
        if (printData) {
            const programs = programOptions.filter((option) =>
                selectedProgram
                    .map((value) => value.toLowerCase())
                    .includes(option.value.toLowerCase())
            );
            const period = periodOptions.find((option) => option.value === selectedPeriod);
            const sales = salesOptions.find((option) => option.value === selectedSales);
            setPrintData((prev) => prev ? ({
                ...prev,
                programName: programs.map((program) => program.label),
                period: period?.label || "",
                salesName: sales?.label || "",
            }) : prev);
        }
    }, [selectedProgram, selectedPeriod, selectedSales]);

    if (isLoading) {
        return <AppSpinner />;
    }

    if (statusMessage || !printData) {
        return (
            <div className="flex min-h-screen items-center justify-center p-6 text-center text-sm text-muted-foreground">
                {"Transaction print data not found." + "(" + statusMessage + ")"}
            </div>
        );
    }

    return (
        <div>
            <div className="mb-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <AppCheckboxList
                    options={programOptions}
                    label="Select Program"
                    isDisabled={isLoadingProgramOptions}
                    isLoading={isLoadingProgramOptions}
                    values={selectedProgram}
                    onValuesChange={(values) => setSelectedProgram(values)}
                />
                <AppAutoComplete
                    options={periodOptions}
                    label="Select Period"
                    isDisabled={isLoadingPeriodOptions}
                    isLoading={isLoadingPeriodOptions}
                    value={selectedPeriod}
                    onValueChange={setSelectedPeriod}
                />
                <AppAutoComplete
                    options={salesOptions}
                    label="Select Sales"
                    isDisabled={isLoadingSalesOptions}
                    isLoading={isLoadingSalesOptions}
                    value={selectedSales}
                    onValueChange={setSelectedSales}
                />
            </div>
            <PDFViewer style={styles.viewer} showToolbar>
                <TransactionPrintDocument data={printData} />
            </PDFViewer>

            <AppModal
                open={isShowStatus}
                onOpenChange={setIsShowStatus}
                title={statusMessage ? "Error" : "Success"}
                showCloseButton={true}
                contentProps={{
                    onOpenAutoFocus: (event) => {
                        event.preventDefault()
                    },
                    onCloseAutoFocus: (event) => {
                        event.preventDefault()
                    },
                }}
                classNames={{
                    content: "sm:max-w-sm",
                    header: "gap-1",
                    title: "text-lg",
                    description: "text-xs",
                    body: "space-y-3",
                    footer: "bg-muted/30",
                }}
                footer={
                    <div className="flex w-full justify-center">
                        <Button
                            type="button"
                            onClick={() => {
                                setStatusMessage("")
                                setIsShowStatus(false)
                            }}
                        >
                            OK
                        </Button>
                    </div>
                }
            >
                <p>{statusMessage}</p>
            </AppModal>
        </div>
    );
};

export default TransactionPrintPage;