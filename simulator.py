#!/usr/bin/env python3
"""
Hardware Fault Simulator
Interactive CLI diagnostic tool simulating common PC hardware faults.
"""

import sys
import time
import random
from dataclasses import dataclass, field
from typing import Optional

# ── ANSI colour helpers ──────────────────────────────────────────────────────

RESET  = "\033[0m"
BOLD   = "\033[1m"
DIM    = "\033[2m"
RED    = "\033[91m"
YELLOW = "\033[93m"
GREEN  = "\033[92m"
CYAN   = "\033[96m"
BLUE   = "\033[94m"
MAGENTA= "\033[95m"

def c(text, *codes): return "".join(codes) + str(text) + RESET
def header(text):    print(f"\n{c('━'*60, CYAN)}\n{c(text, BOLD, CYAN)}\n{c('━'*60, CYAN)}")
def warn(text):      print(f"  {c('⚠', YELLOW)}  {c(text, YELLOW)}")
def ok(text):        print(f"  {c('✓', GREEN)}  {c(text, GREEN)}")
def err(text):       print(f"  {c('✗', RED)}  {c(text, RED)}")
def info(text):      print(f"  {c('›', CYAN)}  {text}")
def dim(text):       print(f"  {c(text, DIM)}")


# ── Data model ───────────────────────────────────────────────────────────────

@dataclass
class Fault:
    id: str
    name: str
    component: str
    severity: str          # "low" | "medium" | "high" | "critical"
    symptoms: list[str]
    root_causes: list[str]
    diagnostic_steps: list[str]
    repair_actions: list[str]
    estimated_cost: str
    data_risk: bool = False

@dataclass
class DiagNode:
    question: str
    yes: Optional["DiagNode | str"] = None   # str = fault id
    no:  Optional["DiagNode | str"] = None


# ── Fault library ────────────────────────────────────────────────────────────

FAULTS: dict[str, Fault] = {

    "ram_bad": Fault(
        id="ram_bad",
        name="Faulty RAM / Memory Error",
        component="RAM",
        severity="high",
        symptoms=[
            "Random BSODs (MEMORY_MANAGEMENT, PAGE_FAULT_IN_NONPAGED_AREA)",
            "System crashes during memory-intensive tasks",
            "Corrupted files after normal saves",
            "Application crashes with no clear cause",
            "POST beep codes (continuous or 3-short beeps on many BIOS)",
        ],
        root_causes=[
            "Failed DRAM cell(s) — common after 5–8 years",
            "Overclocking XMP/EXPO profile instability",
            "Incompatible DIMM mix (different timings/voltages)",
            "Physical damage or oxidised contacts",
            "ESD damage from improper handling",
        ],
        diagnostic_steps=[
            "Run MemTest86 (bootable USB) — at least 2 full passes",
            "Test each DIMM individually in slot A2",
            "Check Windows Event Viewer → System → Error 1001/1003",
            "Verify XMP/EXPO is disabled; run at JEDEC spec first",
            "Inspect DIMM slots for bent pins or debris",
        ],
        repair_actions=[
            "Reseat DIMMs — clean contacts with 99% isopropyl alcohol",
            "Disable XMP and test at stock speeds",
            "Try DIMMs in alternate slots (consult mobo manual for single/dual-channel layout)",
            "RMA failed DIMM(s) — most have lifetime warranty",
            "Replace with known-good compatible kit from QVL",
        ],
        estimated_cost="$0 (reseat/RMA) – $80–$200 (new DDR5 kit)",
        data_risk=False,
    ),

    "hdd_fail": Fault(
        id="hdd_fail",
        name="Hard Drive Mechanical Failure",
        component="HDD",
        severity="critical",
        symptoms=[
            "Clicking, grinding, or whirring noises from drive bay",
            "Very long boot times or hangs at POST",
            "CrystalDiskInfo shows 'Caution' or 'Bad' health",
            "Reallocated Sectors Count (SMART ID 5) > 0",
            "Files suddenly missing or unreadable",
            "Frequent I/O errors in Event Viewer (disk, Disk, NTFS)",
        ],
        root_causes=[
            "Read/write head crash — physical contact with platter",
            "Spindle motor bearing failure",
            "PCB failure (common after power surge)",
            "Corrupted MBR/partition table",
            "Firmware bug (rare, affects specific HDD model batches)",
        ],
        diagnostic_steps=[
            "Run CrystalDiskInfo — check all SMART attributes immediately",
            "Check SMART via cmd: wmic diskdrive get status",
            "Run chkdsk /r /f (schedule on reboot) — note bad sectors",
            "Listen for clicking (click-of-death = head failure)",
            "Test with HD Tune or HDDScan for surface scan errors",
        ],
        repair_actions=[
            "STOP using the drive immediately if clicking is present",
            "Back up all data NOW before any further diagnostics",
            "If PCB failed: swap PCB from identical donor drive (same firmware)",
            "Logical errors only: use TestDisk to recover partition table",
            "Physical failure: contact data recovery lab (DriveSavers, Ontrack)",
            "Replace with SSD — HDDs are legacy for OS drives",
        ],
        estimated_cost="$0 (logical fix) – $300–$2000 (professional data recovery)",
        data_risk=True,
    ),

    "ssd_fail": Fault(
        id="ssd_fail",
        name="SSD Failure / NAND Wear-Out",
        component="SSD",
        severity="high",
        symptoms=[
            "Drive suddenly read-only — SSD entered SLC write-protect mode",
            "CrystalDiskInfo shows TBW (terabytes written) near rated limit",
            "System hangs on SSD-intensive operations",
            "Drive disappears from BIOS after power cycle",
            "NVMe thermal throttling (>70°C sustained)",
        ],
        root_causes=[
            "NAND wear-out — all cells have limited P/E cycles",
            "Overheating controller (NVMe without heatsink in tight cases)",
            "Sudden power loss corrupting firmware metadata",
            "Counterfeit or relabelled low-grade NAND",
            "PCIe slot power delivery issue (M.2 NVMe)",
        ],
        diagnostic_steps=[
            "CrystalDiskInfo: check 'Percentage Used' and 'Available Spare'",
            "NVMe: nvme smart-log /dev/nvme0 (Linux) or Samsung Magician (Win)",
            "Monitor temps under load — HWiNFO64 → NVMe temp sensor",
            "Check BIOS/UEFI: is drive visible? Note any SMART errors",
            "Test with a different SATA cable / M.2 slot",
        ],
        repair_actions=[
            "Add M.2 heatsink if temps exceed 70°C sustained",
            "Update SSD firmware via manufacturer tool",
            "Reseat M.2 — check gold contacts for oxidation",
            "Secure erase + reformat if drive becomes responsive",
            "Replace drive — SSD prices ~$60–$120 for 1TB NVMe",
        ],
        estimated_cost="$0 (reseat/firmware) – $80–$150 (replacement SSD)",
        data_risk=True,
    ),

    "psu_fail": Fault(
        id="psu_fail",
        name="Power Supply Failure / Rail Instability",
        component="PSU",
        severity="critical",
        symptoms=[
            "System powers off randomly under GPU/CPU load",
            "Won't POST — fans spin for 1–2 sec then cut off",
            "Burning smell from PSU area",
            "Voltage rails out-of-spec (HWiNFO: 12V < 11.4V under load)",
            "Multiple components fail in sequence — PSU killing hardware",
        ],
        root_causes=[
            "Capacitor aging — electrolytic caps degrade after 5–7 years",
            "Underpowered PSU — system draw exceeds continuous rating",
            "Failed overcurrent protection tripping under spiky GPU load",
            "Damaged wiring from cable management (pinched cables)",
            "Internal short from debris or failed fan causing overtemp",
        ],
        diagnostic_steps=[
            "Paperclip test: short PS_ON (green) to GND (black) on 24-pin — fan should spin",
            "Measure 12V, 5V, 3.3V rails under no-load with multimeter",
            "HWiNFO64: monitor all voltage rails during stress test (FurMark)",
            "Check PSU wattage vs system TDP (use PCPartPicker estimator + 20% headroom)",
            "Smell the PSU exhaust — burnt capacitor has a distinct sweet/acrid odour",
        ],
        repair_actions=[
            "Do NOT open a PSU — lethal voltages stored in capacitors",
            "Replace PSU: buy from reputable tier (Seasonic, Corsair RMx, EVGA G6)",
            "Use 80+ Gold rated PSU with 20–30% headroom above system TDP",
            "Test with known-good PSU from spare parts to confirm diagnosis",
            "If PSU killed other components, test each component individually",
        ],
        estimated_cost="$60–$180 (quality 650W–850W replacement)",
        data_risk=False,
    ),

    "gpu_artifact": Fault(
        id="gpu_artifact",
        name="GPU Failure / Visual Artefacts",
        component="GPU",
        severity="high",
        symptoms=[
            "Screen corruption — random pixels, colour bands, texture glitches",
            "Driver crashes: 'Display driver stopped responding and has recovered'",
            "Black screen under GPU load, recovers after cool-down",
            "Artifacting in 3D applications but not desktop",
            "GPU fan not spinning (thermal protection shuts down rendering)",
        ],
        root_causes=[
            "VRAM failure — solder bumps crack from thermal cycling",
            "GPU core overheat — dried thermal paste after 3–5 years",
            "Overclocking instability (too high core/memory clock)",
            "PCIe power connector not fully seated",
            "Driver corruption after failed update",
        ],
        diagnostic_steps=[
            "Run GPU-Z — check GPU temp, VRAM usage, PCIe slot width (x16 vs x8/x4)",
            "Stress test: FurMark 1080p 15 min — watch for artefacts and temp",
            "DDU (Display Driver Uninstaller) in safe mode → reinstall clean driver",
            "Check PCIe power connectors — all 6/8-pin fully clicked?",
            "Swap to a different PCIe x16 slot or test in another system",
        ],
        repair_actions=[
            "Reapply thermal paste + replace thermal pads on VRAM chips",
            "Clean fan blades — clogged fan = 20–30°C higher temps",
            "Roll back or clean-install GPU driver via DDU",
            "Reseat GPU and PCIe power connectors",
            "Reflow solder (heat gun method) — temporary fix for cracked bumps",
            "RMA if under warranty; replace GPU otherwise",
        ],
        estimated_cost="$5 (thermal paste) – $200–$800 (GPU replacement)",
        data_risk=False,
    ),

    "cpu_overheat": Fault(
        id="cpu_overheat",
        name="CPU Overheating / Thermal Throttling",
        component="CPU",
        severity="medium",
        symptoms=[
            "System shuts down after 10–30 min under load",
            "Sudden performance drop mid-game/render (throttling)",
            "HWiNFO: CPU temps >95°C (Intel) or >90°C (AMD Ryzen)",
            "High-pitched CPU fan at maximum RPM",
            "WHEA errors in Event Viewer (thermal-induced instability)",
        ],
        root_causes=[
            "Dried or cracked CPU thermal paste (replace every 3–5 years)",
            "Cooler not making full contact — mounting pressure uneven",
            "Inadequate cooler for CPU TDP (stock cooler on 125W+ CPU)",
            "Case airflow obstruction — cables blocking front intake",
            "Ambient temperature too high, or case fan failure",
        ],
        diagnostic_steps=[
            "HWiNFO64: log CPU Package temp, CPU TjMax, and throttling flag",
            "Stress test: Cinebench R23 or AIDA64 FPU — 10 min",
            "Inspect cooler: is mounting hardware tight? Any gaps?",
            "Check all case fans spinning at correct RPM in BIOS",
            "Measure intake vs exhaust temps (IR thermometer)",
        ],
        repair_actions=[
            "Remove cooler, clean old paste with isopropyl alcohol + lint-free wipe",
            "Apply fresh thermal paste (Noctua NT-H1, Thermal Grizzly Kryonaut)",
            "Re-mount cooler evenly — use X-pattern screw tightening",
            "Upgrade cooler if stock (Noctua NH-U12S, be quiet! Dark Rock 4)",
            "Improve case airflow: 2 front intake + 1 rear exhaust minimum",
            "Enable Eco Mode (AMD) or set power limit in BIOS",
        ],
        estimated_cost="$5–$10 (thermal paste) – $40–$100 (aftermarket cooler)",
        data_risk=False,
    ),

    "mobo_post": Fault(
        id="mobo_post",
        name="Motherboard POST Failure",
        component="Motherboard",
        severity="critical",
        symptoms=[
            "No video output — black screen after power button press",
            "Q-Code / debug LEDs: CPU, DRAM, VGA, BOOT error light stays on",
            "No POST beep with speaker installed",
            "System resets in loop without reaching BIOS",
            "USB devices not initialising (no keyboard/mouse power)",
        ],
        root_causes=[
            "BIOS/UEFI corruption — failed update or CMOS battery dead",
            "CPU not seated correctly or bent pins (Intel LGA socket)",
            "Standoff shorting — mobo touching case without correct standoffs",
            "Incompatible CPU — CPU requires BIOS update but can't boot to update",
            "Dead VRM — power delivery to CPU failed",
        ],
        diagnostic_steps=[
            "Read Q-Code LED: consult mobo manual for error code meaning",
            "Clear CMOS: remove battery 30 sec, or use CLR_CMOS jumper",
            "Breadboard test: mobo outside case on cardboard — eliminates standoff short",
            "Inspect LGA socket pins with magnifier/phone macro lens",
            "Try BIOS Flashback (if supported) to recover without CPU/RAM",
        ],
        repair_actions=[
            "Clear CMOS — resolves most POST failures after bad OC or BIOS issue",
            "Reseat CPU carefully; on Intel, check for bent pins in socket",
            "Replace CMOS battery (CR2032) if >5 years old or clock keeps resetting",
            "Use BIOS Flashback to update BIOS for new CPU compatibility",
            "Breadboard with minimum hardware: 1 DIMM, no GPU (use iGPU), no drives",
            "RMA motherboard if VRM or chipset failure confirmed",
        ],
        estimated_cost="$0 (CMOS clear) – $150–$500 (motherboard replacement)",
        data_risk=False,
    ),

    "network_nic": Fault(
        id="network_nic",
        name="NIC / Network Adapter Failure",
        component="Network",
        severity="low",
        symptoms=[
            "No network connectivity — 'Unidentified Network' or no adapter in Device Manager",
            "Random disconnects every few minutes",
            "Speeds far below rated (1 Gbps NIC getting 10 Mbps)",
            "Packet loss spike when pinging gateway",
            "Windows event: 'The network link has been disconnected'",
        ],
        root_causes=[
            "Driver corruption after Windows Update",
            "Failed NIC chip — common on cheap motherboard onboard NICs",
            "Faulty Ethernet cable or damaged RJ45 jack",
            "Router/switch port failure",
            "Wake-on-LAN power issue causing NIC reset",
        ],
        diagnostic_steps=[
            "Device Manager: yellow ! on NIC? Note error code",
            "Test with different Ethernet cable and different switch port",
            "Ping 192.168.x.1 (gateway) — measure packet loss over 100 pings",
            "Check NIC LEDs: link light (green) and activity (orange/green flicker)",
            "Test with USB-to-Ethernet adapter to isolate onboard NIC vs mobo",
        ],
        repair_actions=[
            "Uninstall driver → reboot (Windows reinstalls automatically)",
            "Download latest NIC driver from mobo manufacturer (not Windows Update)",
            "Disable 'Allow computer to turn off this device to save power' in Device Manager",
            "Add PCIe NIC (Intel I225-V based) — ~$25 and more reliable than onboard",
            "Replace Ethernet cable — Cat5e minimum, Cat6 for Gigabit reliability",
        ],
        estimated_cost="$0 (driver fix) – $25 (PCIe NIC card)",
        data_risk=False,
    ),

    "boot_os": Fault(
        id="boot_os",
        name="OS Boot Failure / Corrupted System Files",
        component="Software/OS",
        severity="high",
        symptoms=[
            "BSOD on boot: INACCESSIBLE_BOOT_DEVICE, CRITICAL_PROCESS_DIED",
            "Stuck at Windows spinner / black screen after logo",
            "winload.efi error — bootloader corrupted",
            "Automatic Repair loop — can't complete startup repair",
            "BOOTMGR is missing (older MBR systems)",
        ],
        root_causes=[
            "Interrupted Windows Update corrupting system files",
            "Drive letter changed for boot partition after drive addition",
            "Corrupted BCD (Boot Configuration Data)",
            "Ransomware or rootkit targeting boot sector",
            "File system corruption from improper shutdown",
        ],
        diagnostic_steps=[
            "Boot to Windows Recovery Environment (WinRE) via install USB",
            "Run: sfc /scannow from elevated cmd in WinRE",
            "Run: DISM /Online /Cleanup-Image /RestoreHealth",
            "Check BCD: bcdedit — verify correct partition GUIDs",
            "Review CBS.log (%windir%\\Logs\\CBS\\CBS.log) for SFC failures",
        ],
        repair_actions=[
            "WinRE → Startup Repair (automatic — fixes BCD in most cases)",
            "Rebuild BCD manually: bootrec /fixmbr && bootrec /fixboot && bootrec /rebuildbcd",
            "Run DISM RestoreHealth then SFC to repair corrupted system files",
            "System Restore to pre-update restore point",
            "In-place upgrade repair: run setup.exe from Windows ISO without deleting data",
            "Last resort: clean install (backup data first via Linux live USB)",
        ],
        estimated_cost="$0 (repair) – $0 (clean install with existing license)",
        data_risk=True,
    ),
}


# ── Diagnostic trees ─────────────────────────────────────────────────────────

def build_main_tree() -> DiagNode:
    """Decision tree: question → yes/no branches → fault id or deeper question."""

    # ── Boot failure sub-tree ──
    boot_tree = DiagNode(
        question="Does the system power on (fans spin, LEDs light up)?",
        yes=DiagNode(
            question="Does the system reach the BIOS/UEFI screen?",
            yes=DiagNode(
                question="Does Windows fail to load (BSOD, spinner loop, black screen)?",
                yes="boot_os",
                no=DiagNode(
                    question="Are there visual artefacts, corruption, or no display at all?",
                    yes="gpu_artifact",
                    no="mobo_post",
                ),
            ),
            no=DiagNode(
                question="Do debug LEDs or Q-Code display an error (CPU/DRAM/VGA/BOOT)?",
                yes="mobo_post",
                no=DiagNode(
                    question="Do you hear clicking or grinding from the drive bay?",
                    yes="hdd_fail",
                    no="mobo_post",
                ),
            ),
        ),
        no=DiagNode(
            question="Do fans spin briefly then immediately stop?",
            yes="psu_fail",
            no=DiagNode(
                question="Is there a burning smell near the power supply?",
                yes="psu_fail",
                no="psu_fail",
            ),
        ),
    )

    # ── Stability/crash sub-tree ──
    stability_tree = DiagNode(
        question="Does the system crash or restart specifically under heavy load (games, renders)?",
        yes=DiagNode(
            question="Does HWiNFO show GPU temps above 85°C or CPU above 90°C before crash?",
            yes=DiagNode(
                question="Is it the GPU overheating (GPU temp > 85°C)?",
                yes="gpu_artifact",
                no="cpu_overheat",
            ),
            no=DiagNode(
                question="Does the 12V rail drop below 11.4V under load in HWiNFO?",
                yes="psu_fail",
                no="ram_bad",
            ),
        ),
        no=DiagNode(
            question="Do crashes happen randomly — even at desktop with no load?",
            yes=DiagNode(
                question="Do you see MEMORY_MANAGEMENT or PAGE_FAULT BSODs?",
                yes="ram_bad",
                no=DiagNode(
                    question="Do crashes correlate with a specific application or driver?",
                    yes="gpu_artifact",
                    no="ram_bad",
                ),
            ),
            no=DiagNode(
                question="Is performance degraded — slowdowns, hangs, or high disk usage?",
                yes=DiagNode(
                    question="Is the affected drive an HDD (spinning disk)?",
                    yes="hdd_fail",
                    no="ssd_fail",
                ),
                no="cpu_overheat",
            ),
        ),
    )

    # ── Storage/data sub-tree ──
    storage_tree = DiagNode(
        question="Do you hear clicking or grinding from the hard drive?",
        yes="hdd_fail",
        no=DiagNode(
            question="Does CrystalDiskInfo report 'Caution' or 'Bad' health?",
            yes=DiagNode(
                question="Is the drive an SSD / NVMe?",
                yes="ssd_fail",
                no="hdd_fail",
            ),
            no=DiagNode(
                question="Is the drive an NVMe SSD that gets very hot (>70°C)?",
                yes="ssd_fail",
                no="hdd_fail",
            ),
        ),
    )

    # ── Root selector ──
    return DiagNode(
        question="What best describes your primary symptom?",
        yes=None,  # unused at root — menu replaces yes/no
        no=None,
    ), boot_tree, stability_tree, storage_tree


# ── Simulation engine ─────────────────────────────────────────────────────────

class FaultSimulator:
    def __init__(self):
        _, self.boot_tree, self.stability_tree, self.storage_tree = build_main_tree()
        self.history: list[str] = []

    # ── UI helpers ────────────────────────────────────────────────────────────

    def prompt_yn(self, question: str) -> bool:
        while True:
            ans = input(f"\n  {c('?', MAGENTA, BOLD)} {question} {c('[y/n]', DIM)} ").strip().lower()
            if ans in ("y", "yes"): return True
            if ans in ("n", "no"):  return False
            print(f"  {c('Please enter y or n.', YELLOW)}")

    def prompt_choice(self, options: list[str]) -> int:
        for i, opt in enumerate(options, 1):
            print(f"  {c(f'[{i}]', CYAN, BOLD)} {opt}")
        while True:
            try:
                n = int(input(f"\n  {c('›', CYAN)} Enter number: ").strip())
                if 1 <= n <= len(options): return n - 1
            except ValueError:
                pass
            print(f"  {c('Invalid choice.', YELLOW)}")

    def press_enter(self):
        input(f"\n  {c('[ Press Enter to continue ]', DIM)}")

    def slow_print(self, text: str, delay: float = 0.018):
        for ch in text:
            sys.stdout.write(ch)
            sys.stdout.flush()
            time.sleep(delay)
        print()

    # ── Screens ───────────────────────────────────────────────────────────────

    def splash(self):
        print(c("""
╔══════════════════════════════════════════════════════════════╗
║          HARDWARE FAULT SIMULATOR  v1.0                     ║
║          PC Diagnostics & Troubleshooting Guide             ║
╚══════════════════════════════════════════════════════════════╝
        """, CYAN, BOLD))
        dim("Simulates real-world PC hardware faults and guides you through repair.")
        dim("Based on real diagnostic procedures used by field technicians.")

    def show_fault(self, fault: Fault):
        header(f"DIAGNOSIS: {fault.name}")

        severity_colour = {
            "low": GREEN, "medium": YELLOW, "high": RED, "critical": RED + BOLD
        }.get(fault.severity, RESET)

        print(f"\n  Component : {c(fault.component, BOLD)}")
        print(f"  Severity  : {c(fault.severity.upper(), severity_colour)}")
        if fault.data_risk:
            warn("DATA AT RISK — back up immediately before proceeding!")

        print(f"\n{c('  SYMPTOMS', BOLD, YELLOW)}")
        for s in fault.symptoms:
            print(f"    {c('·', YELLOW)} {s}")

        print(f"\n{c('  ROOT CAUSES', BOLD, CYAN)}")
        for r in fault.root_causes:
            print(f"    {c('·', CYAN)} {r}")

        print(f"\n{c('  DIAGNOSTIC STEPS', BOLD, BLUE)}")
        for i, d in enumerate(fault.diagnostic_steps, 1):
            print(f"    {c(str(i)+'.', BLUE, BOLD)} {d}")

        print(f"\n{c('  REPAIR ACTIONS', BOLD, GREEN)}")
        for i, a in enumerate(fault.repair_actions, 1):
            print(f"    {c(str(i)+'.', GREEN, BOLD)} {a}")

        print(f"\n{c('  ESTIMATED COST', BOLD)}")
        print(f"    {c(fault.estimated_cost, MAGENTA)}")

        self.history.append(fault.name)

    # ── Scenario simulation ───────────────────────────────────────────────────

    def simulate_fault(self, fault: Fault):
        """Animated 'boot sequence' simulating the fault scenario."""
        header(f"SIMULATING: {fault.name}")
        print()
        time.sleep(0.3)

        lines = {
            "RAM": [
                "[ BIOS ] Initialising memory controller...",
                "[ BIOS ] Testing installed DIMMs at XMP-6000 (DDR5)...",
                "[ MEM  ] DIMM slot A2: testing row 0x7F3A... ",
                "[ MEM  ] !! Uncorrectable ECC error at address 0x7F3A_0044 !!",
                "[ OS   ] KERNEL_DATA_INPAGE_ERROR — initiating crash dump...",
                "[ OS   ] *** STOP: 0x0000007A PAGE_FAULT_IN_NONPAGED_AREA",
            ],
            "HDD": [
                "[ BIOS ] Detecting storage devices...",
                "[ SATA ] Port 0: ST2000DM008-2FR102 — spinning up...",
                "[ SATA ] Seeking track 0...",
                "[ HDD  ] !! Seek error — read head failed to position !!",
                "[ HDD  ] !! Reallocated sector count: 2847 (critical) !!",
                "[ BIOS ] Drive not responding — boot device unavailable",
            ],
            "SSD": [
                "[ BIOS ] Detecting NVMe devices on M.2_1 slot...",
                "[ NVME ] Samsung 980 Pro 1TB — firmware EXA22B6Q",
                "[ NVME ] SMART: Percentage Used = 98%, Available Spare = 0%",
                "[ NVME ] Controller temp: 82°C — thermal throttle active",
                "[ NVME ] !! Write protect enabled — NAND wear threshold exceeded !!",
                "[ OS   ] Disk access error 0x80070057 — drive is read-only",
            ],
            "PSU": [
                "[ SYS  ] Power button pressed — ATX standby 5V OK",
                "[ PSU  ] 12V rail: 12.1V — 5V rail: 5.0V — 3.3V rail: 3.31V",
                "[ SYS  ] GPU power draw spike: 380W (RTX 4090 boost)...",
                "[ PSU  ] 12V rail dropping: 11.8V... 11.3V... 10.9V...",
                "[ PSU  ] !! OCP triggered — overcurrent protection engaged !!",
                "[ SYS  ] System power cut. All fans spin down.",
            ],
            "GPU": [
                "[ BIOS ] Detecting PCIe devices...",
                "[ PCIE ] Slot 1 x16: RTX 4070 Ti — driver GeForce 546.65",
                "[ OS   ] Starting 3D application — GPU core 2535 MHz, VRAM 12GB",
                "[ GPU  ] VRAM temp: 94°C — memory errors beginning...",
                "[ DX   ] DXGI_ERROR_DEVICE_REMOVED — display driver reset",
                "[ OS   ] 'Display driver nvlddmkm stopped responding and has recovered'",
            ],
            "CPU": [
                "[ BIOS ] CPU: Intel Core i9-13900K @ 5.8 GHz (P-core boost)",
                "[ CPU  ] Entering Cinebench R23 multi-thread workload...",
                "[ CPU  ] Package temp: 72°C ... 84°C ... 96°C ... 100°C (TjMax!)",
                "[ CPU  ] !! Thermal throttle activated — clocks reduced to 800 MHz !!",
                "[ CPU  ] Score: 4,200 (expected: 40,000) — 90% performance lost",
                "[ SYS  ] Thermal shutdown imminent — save your work!",
            ],
            "Motherboard": [
                "[ SYS  ] Power on — initialising POST sequence...",
                "[ POST ] Checking CPU subsystem...",
                "[ POST ] !! CPU debug LED: solid RED !!",
                "[ POST ] CPU not detected or not supported",
                "[ POST ] BIOS version: 0603 — CPU requires BIOS 1002+",
                "[ SYS  ] System halted — update BIOS via USB Flashback",
            ],
            "Network": [
                "[ OS   ] Network adapter: Intel I225-V 2.5GbE initialising...",
                "[ NIC  ] Link detected: 1000 Mbps Full Duplex",
                "[ NIC  ] DHCP lease acquired: 192.168.1.105",
                "[ NIC  ] Testing throughput: iPerf3 to router...",
                "[ NIC  ] !! Packet loss: 34% — NIC firmware bug detected !!",
                "[ NIC  ] Resetting adapter... link down... link up... ping timeout",
            ],
            "Software/OS": [
                "[ UEFI ] Handing control to Windows bootloader...",
                "[ BOOT ] winload.efi loading kernel...",
                "[ OS   ] Applying Windows Update KB5033375...",
                "[ OS   ] !! Update interrupted — power loss detected !!",
                "[ OS   ] Checking file system integrity...",
                "[ OS   ] CRITICAL_PROCESS_DIED — BSOD code: 0x000000EF",
            ],
        }.get(fault.component, ["Simulating fault...", "Error detected.", "Diagnosis required."])

        for line in lines:
            time.sleep(0.35)
            is_error = "!!" in line
            colour = RED if is_error else (GREEN if "OK" in line or "OK" in line else DIM)
            print(f"  {c(line, colour)}")

        print()
        warn(f"Fault detected: {fault.name}")
        self.press_enter()

    # ── Diagnostic tree walker ────────────────────────────────────────────────

    def walk_tree(self, node: "DiagNode | str") -> Optional[Fault]:
        if isinstance(node, str):
            return FAULTS.get(node)

        answer = self.prompt_yn(node.question)
        branch = node.yes if answer else node.no
        if branch is None:
            return None
        return self.walk_tree(branch)

    # ── Mode: Guided Diagnostic ───────────────────────────────────────────────

    def guided_diagnostic(self):
        header("GUIDED DIAGNOSTIC")
        print()
        info("Answer the following questions to identify the fault.")
        info("Answer based on what you observe on the system under test.\n")

        print(f"  {c('What is the main symptom category?', BOLD)}\n")
        cats = [
            "Boot / startup failure (won't POST, no video, immediate power-off)",
            "Instability / crashes / BSODs during use",
            "Storage / data issues (slow drive, missing files, clicking)",
            "Network connectivity problems",
            "Overheating / thermal issues",
        ]
        choice = self.prompt_choice(cats)

        fault: Optional[Fault] = None

        if choice == 0:
            fault = self.walk_tree(self.boot_tree)
        elif choice == 1:
            fault = self.walk_tree(self.stability_tree)
        elif choice == 2:
            fault = self.walk_tree(self.storage_tree)
        elif choice == 3:
            fault = FAULTS["network_nic"]
        elif choice == 4:
            fault = self.walk_tree(DiagNode(
                question="Is the CPU temperature above 90°C under load?",
                yes="cpu_overheat",
                no=DiagNode(
                    question="Is the GPU temperature above 85°C under load?",
                    yes="gpu_artifact",
                    no="cpu_overheat",
                ),
            ))

        if fault:
            print()
            ok(f"Fault identified: {fault.name}")
            self.press_enter()
            self.show_fault(fault)
        else:
            warn("Could not narrow down to a specific fault. Try the fault browser.")

        self.press_enter()

    # ── Mode: Fault Browser ───────────────────────────────────────────────────

    def fault_browser(self):
        header("FAULT BROWSER")
        print()
        info("Select a fault to view full details and repair procedures.\n")

        sorted_faults = sorted(FAULTS.values(), key=lambda f: f.component)
        labels = [f"{c(f.component, CYAN):25s} {f.name}" for f in sorted_faults]
        labels.append("← Back to main menu")

        choice = self.prompt_choice(labels)
        if choice == len(sorted_faults):
            return

        fault = sorted_faults[choice]
        self.show_fault(fault)
        self.press_enter()

    # ── Mode: Fault Simulation ────────────────────────────────────────────────

    def fault_simulation(self):
        header("FAULT SIMULATION")
        print()
        info("Choose a scenario to simulate — watch the boot sequence fail in real time.\n")

        sorted_faults = sorted(FAULTS.values(), key=lambda f: f.component)
        labels = [f"{c(f.component, CYAN):25s} {f.name}" for f in sorted_faults]
        labels.append("Random fault")
        labels.append("← Back to main menu")

        choice = self.prompt_choice(labels)
        if choice == len(sorted_faults) + 1:
            return
        if choice == len(sorted_faults):
            fault = random.choice(list(FAULTS.values()))
        else:
            fault = sorted_faults[choice]

        self.simulate_fault(fault)
        self.show_fault(fault)
        self.press_enter()

    # ── Mode: Quick Reference ─────────────────────────────────────────────────

    def quick_reference(self):
        header("QUICK REFERENCE — BEEP CODES & COMMON ERROR CODES")

        print(f"\n{c('  BIOS POST BEEP CODES (AMI BIOS)', BOLD, YELLOW)}")
        beeps = [
            ("1 short",      "POST passed — normal boot"),
            ("2 short",      "POST error — check BIOS settings"),
            ("3 long",       "Keyboard controller failure"),
            ("1 long 2 short","Video adapter failure (GPU issue)"),
            ("1 long 3 short","Video adapter failure (extended)"),
            ("Continuous",   "RAM not detected / not seated"),
            ("No beep",      "PSU failure or speaker not connected"),
        ]
        for code, meaning in beeps:
            print(f"    {c(code, CYAN):22s} {meaning}")

        print(f"\n{c('  COMMON WINDOWS BSOD STOP CODES', BOLD, YELLOW)}")
        bsods = [
            ("0x0000001A", "MEMORY_MANAGEMENT         → RAM failure"),
            ("0x00000050", "PAGE_FAULT_IN_NONPAGED    → RAM or driver"),
            ("0x0000007A", "KERNEL_DATA_INPAGE_ERROR  → HDD/SSD or RAM"),
            ("0x0000007E", "SYSTEM_THREAD_EXCEPTION   → Driver bug"),
            ("0x000000EF", "CRITICAL_PROCESS_DIED     → OS corruption"),
            ("0x0000009F", "DRIVER_POWER_STATE_FAIL   → Driver/sleep bug"),
            ("0xC000021A", "WINLOGON/CSRSS crashed    → OS corruption"),
            ("0x00000124", "WHEA_UNCORRECTABLE_ERROR  → Hardware/OC issue"),
        ]
        for code, meaning in bsods:
            print(f"    {c(code, RED):14s} {meaning}")

        print(f"\n{c('  SMART CRITICAL ATTRIBUTE IDs', BOLD, YELLOW)}")
        smart = [
            ("ID 5",   "Reallocated Sectors Count — >0 is serious on HDD"),
            ("ID 187", "Reported Uncorrectable Errors — SSD concern"),
            ("ID 197", "Current Pending Sector Count — about to fail"),
            ("ID 198", "Uncorrectable Sector Count — already failed"),
            ("ID 177", "SSD Wear Leveling Count — tracks NAND wear"),
            ("ID 202", "Percent Lifetime Used (some SSDs) — 100 = end of life"),
        ]
        for id_, meaning in smart:
            print(f"    {c(id_, MAGENTA):10s} {meaning}")

        print(f"\n{c('  VOLTAGE RAIL TOLERANCES (ATX spec ±5%)', BOLD, YELLOW)}")
        rails = [
            ("12V", "11.4V – 12.6V  (most critical — GPU/CPU)"),
            ("5V",  " 4.75V – 5.25V (storage, USB)"),
            ("3.3V"," 3.135V – 3.465V (RAM, chipset)"),
        ]
        for rail, tol in rails:
            print(f"    {c(rail, GREEN):8s} {tol}")

        self.press_enter()

    # ── Mode: Session History ─────────────────────────────────────────────────

    def show_history(self):
        header("SESSION HISTORY")
        if not self.history:
            info("No faults diagnosed yet in this session.")
        else:
            info(f"{len(self.history)} fault(s) reviewed this session:\n")
            for i, name in enumerate(self.history, 1):
                print(f"    {c(str(i)+'.', CYAN, BOLD)} {name}")
        self.press_enter()

    # ── Main loop ─────────────────────────────────────────────────────────────

    def run(self):
        self.splash()
        self.press_enter()

        while True:
            header("MAIN MENU")
            print()
            menu = [
                f"{c('Guided Diagnostic', BOLD)}   — answer questions to identify your fault",
                f"{c('Fault Browser', BOLD)}        — browse all faults with full repair guides",
                f"{c('Fault Simulation', BOLD)}     — watch a fault scenario play out in real time",
                f"{c('Quick Reference', BOLD)}      — BSOD codes, beep codes, SMART IDs, voltages",
                f"{c('Session History', BOLD)}      — faults reviewed this session",
                f"{c('Exit', BOLD)}",
            ]
            choice = self.prompt_choice(menu)

            actions = [
                self.guided_diagnostic,
                self.fault_browser,
                self.fault_simulation,
                self.quick_reference,
                self.show_history,
            ]

            if choice == 5:
                print(f"\n{c('  Goodbye. Keep those temps low!', CYAN)}\n")
                break

            actions[choice]()


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    try:
        FaultSimulator().run()
    except KeyboardInterrupt:
        print(f"\n\n{c('  Interrupted. Exiting.', DIM)}\n")
        sys.exit(0)
