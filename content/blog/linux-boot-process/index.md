---
title: The Linux Boot Process
date: "2020-06-09"
description: "A look at the common modern GNU/Linux boot process (UEFI, GRUB 2, and initramfs)"
---

Today sul tavalo we have the Linux boot process. I figured what better place to start than with the boot process, sometimes referred to as bootstrapping, by old school folks, from where the word boot comes.  

## Overview
Booting Linux consists of multiple stage, similar to most operating systems, but most similar to BSD and the other Unix-like operating systems. The general stages are initialization of firmware, execution of bootloader, initialization of Linux kernel, and execution of startup scripts. Each of these stages vary depending on software, and sometimes hardware, components. The boot step are generally viewed as the following.

```
+------------------------+        +------------------------+        +------------------------+        +------------------------+        +------------------------+        +------------------------+        +------------------------+        +------------------------+        +------------------------+        +------------------------+
|       Load UEFI        |        |    Early EFI stages    |        |  Select boot device    |        |     Identify ESP       |        |    Load boot loader    |        |  Select boot options   |        |      Load kernel       |        | Mount root filesystem  |        |      Start init        |        |Execute startup scripts |
|------------------------|        |------------------------|        |------------------------|        |------------------------|        |------------------------|        |------------------------|        |------------------------|        |------------------------|        |------------------------|        |------------------------|
|from code stored        | -----> |probe for hardware,     | -----> |from EFI boot manager   | -----> |(EFI System Partition)  | -----> |is an optional step     | -----> |i.e. which kernel -     | -----> |Read kernel into memory | -----> |real root fs may be     | -----> |technically /sbin/init  | -----> |and launch services     |
|in NVRAM                |        |load EFI drivers        |        |menu or automatically   |        |separate step, but same |        |                        |        |most likely automatic   |        |and instantiate kernel  |        |mounted or temporary fs |        |symlinked to systemd -  |        |like getty, ssh, sockets|
|                        |        |                        |        |                        |        |UEFI phase as next step |        |                        |        |from a config           |        |data structures in mem  |        |in memory first         |        |PID 1                   |        |                        |
+------------------------+        +------------------------+        +------------------------+        +------------------------+        +------------------------+        +------------------------+        +------------------------+        +------------------------+        +------------------------+        +------------------------+
```

## UEFI
UEFI or Unified Extensible Firmware Interface is a software specification that defines how an operating system and device firmware communicate between each other. UEFI is not just the software standard but the actual software/system firmware itself. Embedded in the motherboard, i.e, installed from the factory, it is the first program to run when a computer boots up. Let's exlpore UEFI in detail.

The UEFI specification defined is hardware/manufacturer agnostic and also defines standard APIs which make UEFI-level device drivers processor-independent.

On typical computers/servers UEFI is stored on the motherboard in SPI (Serial Peripheral Interface) chip on a (NOR) flash memory chip. As soon as powered on the CPU is wired to execute a Built-in Self Test, some microcode routines, potentially followed a reset vector, but it will eventually run the UEFI code from the SPI flash memory.

UEFI can be thought of as a mini OS itself. It normally comes complete with an accessible shell, the EFI shell, and a GUI, the UEFI menu. It's worth mentioning, while many times the UEFI menu is modeled after older computer BIOS menus for familiarity, this is totally unnecessary. UEFI as a "mini OS" can support much more complex GUIs and even run games. 

Settings, or parameters, set in the UEFI menu are stored separately from the "read-only" NOR chip, in an area of the SPI chip that contains NVRAM (non-volatile RAM). This NVRAM can be found in two forms, SRAM (static RAM) sometimes called "CMOS" NVRAM, or EEPROM. The former needs a battery to supply power when the main power supply is in the powered down state to maintain the parameter settings, which is from where the CMOS term comes. CMOS the acronym for complementary metal-oxide semiconductor, a type of battery powered semiconductor that has historically been used to store BIOS settings as well as keep the RTC (real time clock). The later, EEPROM, maintains its data with electral charges that maintain state without electrical power. (As a sidenote, most motherboards that make use of EEPROM will still have a battery to maintain the RTC). This is not supposed to be a post about hardware or electrical engineering, so we'll leave that for now. 

Let's get back to the steps of the boot process, specifically the steps that make up the UEFI portion.

```
+-------------------------+       +-------------------------+       +-------------------------+       +-------------------------+       +-------------------------+       +-------------------------+       +-------------------------+       +-------------------------+
|                         |       |    Firmware routines    |       |  Security (SEC) phase   |       | Pre-EFI Initialization  |       | Driver Execution        |       |  Boot Device Selection  |       |  Transient System Load  |       |   Runtime (RT) phase    |
|                         |       |-------------------------|       |-------------------------|       | (PEI) phase             |       | Environment (DXE) phase |       |  (BDS) phase            |       |  (TSL) phase            |       |-------------------------|
|                         |       |Pre-UEFI. Architecture   |       |Initalize UEFI firmware  |       |-------------------------|       |-------------------------|       |-------------------------|       |-------------------------|       |UEFI program hands full  |
|        Power on         |       |specific. Assembly       |       |and temporary memory.    |       |Test and initalize low-  |       |Load and execute EFI     |       |Boot options processed,  |       |UEFI loads and executes  |       |control to OS, exits no  |
|                         | ----> |program executed from    | ----> |Called SEC because root  | ----> |level hardware. Restore  | ----> |drivers. UEFI to OS      | ----> |boot policy decided,     | ----> |selected EFI application | ----> |longer needed firmware   |
|                         |       |flash (flush CPU cache,  |       |of trust starts here.    |       |from sleep also happens  |       |runtime services are     |       |signature verification,  |       |such as OS boot loader.  |       |processes, and clears    |
|                         |       |platform reset, etc).    |       |                         |       |here.                    |       |initialized.             |       |EFI application selected.|       |                         |       |itself from memory.      |
+-------------------------+       +-------------------------+       +-------------------------+       +-------------------------+       +-------------------------+       +-------------------------+       +-------------------------+       +-------------------------+
```

There is so much more to say about UEFI on areas like the EFI shell, modes of operation (Boot, User, Setup, and Update), UEFI Flash structure, networking in UEFI, and many other neat things, but maybe that's a post for another time. With an overview of UEFI we can now focus on the Boot Device Selection (BDS) phase and after. 

In the UEFI BDS phase, the GPT partition table is read and EFI System Partitions (ESP) are identified. ESPs are just generic FAT filesystems, that are mounted, read and written like any normal filesystem. These filesystems contain .efi executables (PE/COFF format). The .efi binaries could be any sort of program, but we'll focus on boot related programs. 

At this point once the ESP is identified, a couple things could happen that are scenario and EFI boot manager specific. If a system has settings saved in the NVRAM marking a certain application as the defualt, the UEFI firmware may locate the stored .efi file and execute it from the ESP. Or the UEFI firmware can search for, read, prompt a user, then execute a selected application file from the ESP. These executable, .efi files, are typically found at a standard path. `<ESP partition>/efi/ubuntu/grubx64.efi` (Ubuntu with Grub for example), `<ESP Partition>/EFI/BOOT/BOOTX64.efi` (required by some motherboards *cough* Lenovo K450 *cough*), or `<ESP partition>/EFI/systemd/systemd-bootx64.efi` (an optional Arch setup with systemd-boot).

As you can tell, these files will typically be an OS boot loader or boot manager that is located. When one of them is selected, most UEFI will save the pathname as configuration parameter to NVRAM.

Moving into the Transient System Load phase, a boot dispatcher fully loads and runs the OS boot loader or manager.

## A word about boot loaders and boot managers
Both boot loaders and boot managers are essentially EFI program. As mentioned, UEFI is effectively a mini OS and boot loaders and boot managers are "programs" that UEFI can execute from the BSD phrase. Often times the terms are used without differentiation, but they are indeed different. 

Boot managers, manage. Most typically via a simple menu of boot options. Control is passed from the boot manger to the user's selection. 
- systemd-boot 
- rEFInd 

Boot loaders, load. They load an OS kernel into memory, load support files when needed and start the kernel. 
- EFI firmware loader (UEFI) / EFI stub (built into the kernel) 
- ELILO 

Some programs function as both.
- burg 
- GRUB 2

Technically no boot loader is required under UEFI. The Linux Kernel can be booted directly by EFI firmware loaders as an EFI executable. It does this by way of a self-extracting kernel image called a zImage presenting itself as .efi executable. You can learn more about this EFI Boot Stub process [here](https://www.kernel.org/doc/html/latest/admin-guide/efi-stub.html). 

FWIW, I like the simplicity of the EFI stub loader a lot. Pairing EFI stub loader with systemd-boot as the boot manager is a great combination. Simple, but has all the features many users should need. And for multiboot systems that have different operating systems, I'll say it is hard to beat rEFInd.

## Booting the OS
For better or for worse, GRUB, or technically GRUB 2 has become the de facto standard boot loader for most Linux distributions. GRUB is The GRand Unified Boot Loader developed by the GNU project. Since GRUB is the most commonly used boot loader (and boot manager) that's what we will be talking about here. 

GRUB is essentially a mini OS itself and provides more features than any boot loader that I know of. There are _some_ valid reasons to use GRUB over the more simple set-up that I prefer. Rod Smith does a great job listing them [here](https://www.rodsbooks.com/efi-bootloaders/grub2.html).

When `grub.efi` is selected (or chosen by the built-in EFI boot manager), it is read into memory. When executed GRUB goes through it's own process. This process starts with GRUB reading a configuration file that noramlly resides in the same directory as the directory as `grub.efi`, i.e. `<ESP>/efi/grub/grub.cfg`. `grub.cfg` is normally generated by a command like `update-grub` or `grub-mkconfig` which takes settings from `/etc/default/grub` and scripts that reside in `/etc/grub.d/` and applies together in the `grub.cfg`.

Depending on the configuration, GRUB may present a menu to select, examine, or edit startup parameters, like which kernel to boot, or to even select a different OS, if GRUB is being used as a chainloader. When a kernel is selected, whether through the menu or automatically via an entry in GRUBs config, GRUB will load the kernel and initramfs into memory and execute the kernel.

## initramfs
The tldr on initramfs is that it is a temporary filesystem that contains the tools and scripts needed (in many cases) to mount the real root filesystem and call the real init script.

Whenever the kernel that's on the system was built, sometime before the boot process, an initramfs was embedded into the kernel. Initramfs, initial RAM filesystem, is just a compressed (cpio) archive containing a normal set of directories that you would find on a root filesystem, modules for mounting the real root filesystem, and a /init script.

Once running the kernel check for initramfs.

Once initramfs is found, the kernel makes a temporary filesystem, tmpfs, and unpacks the archived filesystem into the temporary, empty root filesystem. The tmpfs is a simple in-memory structure filesystem derivate of ramfs (RAM filesystem). This would be achieved with something like `mount -t tmpfs nodev / && cpio -i < initramfs.cpio`

A second external initramfs may be loaded in addition to the first that is embedded in the kernel. Files in the external initramfs will overwrite files with the same name from the embedded initramfs, that have already been unarchived and loaded.

intramfs is actually not necessary, but I have included it because it is part of the common Linux boot process. So why does it exist? "Out-of-the-box" Linux distributions will include initramfs to bootstrap the system only to the point where the kernel can use the temporary root filesystem, drivers, and modules lo load and access the real root filesystem. Many Linux distributions shipped to run on various platforms use initramfs to handle unknonwns and make use of kernel modules. The common unknonwns are filesystem type and disk layout. Different drivers may be required for devices like SCSI, SATA, IDE, network booting, USB, Bluetooth filesystem loader, and others. A few common reason to use kernel modules so early on are the need to support LVM, have an encrypted rootfs where a password is required to decrypt, and software raid. It is normally necessary that the kernel load those drivers modules first through initramfs. As such, intramfs does not have to contain every module, but only the modules necessary for the kerenel to access and mount the root filesystem. On a system where the filesystem is known and the extra support from the modules is not necessary, neither is an initramfs. One can forego initramfs to increase boot performance in many cases.

After initramfs is extracted in memory the kernel then executes a script at `/init` in the tmpfs rootfs. This starts the first userspace process. The `/init` script takes the filesystem that initramfs loaded and replaces it with the real root filesystem. The final call from the `/init` script is to the `/sbin/init` binary which replaces the `/init` process itself. `/sbin/init` is in the real rootfs and is what continues the boot process. On most modern systems you will find `/sbin/init` is a symlink to `/lib/systemd/systemd`. 

The kernel should have completed initialization and UEFI should be completing the runtime phase, handing over complete control. 

## Systemd
Being the 'init' systemd has a couple special privilges, but really it's just a user-level program like other daemons. However, systemd is not just a single management daemon, but a collection of programs, daemons, libraries, and kernel components. For this post we will try to scope the focus to just the start up procedure of systemd. It gets a little complex to detail in chronological order because at this point many processes are running in parallel.

There are two "trees" of processes that start at this point. The first is the systemd tree which we'll discuss in a second. The second, that I'll only mention now are the autonomous non-configurable kernel process that spawn upon initialization. There typically a lot of them, but they general don't effect the user or and don't require and administration. They can be seen with `ps -ef f` at the top of the tree, belonging to `[kthreadd]` that normally has a PID of 2. They will have a low PID, a parent PID of 2, and as kernel processes, they will also have brackets surrounding their name.

For the systemd tree, I think the ASCII chart below from [freedesktop.org](https://www.freedesktop.org/software/systemd/man/bootup.html) does a fair job of illustrating the various parallel systemd processes. If you don't understand what any of this means, I'll try and summarize it here and do a complete post on systemd later.
```
                                     cryptsetup-pre.target
                                                  |
(various low-level                                v
 API VFS mounts:                 (various cryptsetup devices...)
 mqueue, configfs,                                |    |
 debugfs, ...)                                    v    |
 |                                  cryptsetup.target  |
 |  (various swap                                 |    |    remote-fs-pre.target
 |   devices...)                                  |    |     |        |
 |    |                                           |    |     |        v
 |    v                       local-fs-pre.target |    |     |  (network file systems)
 |  swap.target                       |           |    v     v                 |
 |    |                               v           |  remote-cryptsetup.target  |
 |    |  (various low-level  (various mounts and  |             |              |
 |    |   services: udevd,    fsck services...)   |             |    remote-fs.target
 |    |   tmpfiles, random            |           |             |             /
 |    |   seed, sysctl, ...)          v           |             |            /
 |    |      |                 local-fs.target    |             |           /
 |    |      |                        |           |             |          /
 \____|______|_______________   ______|___________/             |         /
                             \ /                                |        /
                              v                                 |       /
                       sysinit.target                           |      /
                              |                                 |     /
       ______________________/|\_____________________           |    /
      /              |        |      |               \          |   /
      |              |        |      |               |          |  /
      v              v        |      v               |          | /
 (various       (various      |  (various            |          |/
  timers...)      paths...)   |   sockets...)        |          |
      |              |        |      |               |          |
      v              v        |      v               |          |
timers.target  paths.target   |  sockets.target      |          |
      |              |        |      |               v          |
      v              \_______ | _____/         rescue.service   |
                             \|/                     |          |
                              v                      v          |
                          basic.target         rescue.target    |
                              |                                 |
                      ________v____________________             |
                     /              |              \            |
                     |              |              |            |
                     v              v              v            |
                 display-    (various system   (various system  |
             manager.service     services        services)      |
                     |         required for        |            |
                     |        graphical UIs)       v            v
                     |              |            multi-user.target
emergency.service    |              |              |
        |            \_____________ | _____________/
        v                          \|/
emergency.target                    v
                              graphical.target
```
To make some sense of the above, let's establish a quick base on systemd. Systemd manages by controlling, e.g. starting, stopping, deconflicting, and managing dependencies or what are called units. Units are just entities managed by systemd typically via a user-configurable configuration file. 

From the systemd man page,
> systemd provides a dependency system between various entities called "units" of 11 different types. Units encapsulate various objects that are relevant for system boot-up and maintenance. The majority of units  are configured in unit configuration files, whose syntax and basic set of options is described in systemd.unit(5) 
> 
> [...] 
> 
> The following unit types are available: 
> 1. Service units, which start and control daemons and the processes they consist of. For details, see systemd.service(5). 
> 2. Socket units, which encapsulate local IPC or network sockets in the system, useful for socket-based activation. For details about socket units, see systemd.socket(5), for details on socket-based activation and other forms of activation, see daemon(7). 
> 3. Target units are useful to group units, or provide well-known synchronization points during boot-up, see systemd.target(5).
> 
>[... 8 more listed ...]

As seen .target units themselves do not offer any functionality, but are used to group units, and synchronizing units, which is used to resolve dependencies in the correct order during start-up. 

While many common targets exist, the ones to really be aware of regarding the boot process are rescue.target, multi-user.target, and graphical.target. If you're familiar with UNIX System V or "traditional init", run levels of the targets would be 1, 3, and 5 respectively. Typically under systemd, these targets will have the following behavior. 
- Rescue.target mounts a minimal set of the filesystem with no service running. It also starts a root shell on the console 
- Multi-user.target mounts all normal filesystems, configures network services, and starts other normal services. 
- Graphical.target is the same as multi-user with the addition of a window system and graphical login manager.

Default.target is the target that the system is configured to try to achieve upon boot. Default.target will normally be a symlink to multi-user.target or graphical.target, depending on whether a GUI is configured to run or not.

One last piece that will help simplify the above is to understand, basic.target is a target that is used as a common synchronization point in the boot process to ensure all dependencies have been loaded before being called by other targets or units that depend on them later in the boot process. Basic.target (and some of the other units) may be in a different order, depending on the OS and the way systemd is configured.

User logins and the user process that follow are managed by user@UID.service. Users can manage a per-user systemd instance with systemd --user, or more correctly `systemlctl --user` that maintains its own hierarchy of units.  

Again, [freedesktop.org](https://www.freedesktop.org/software/systemd/man/bootup.html) provides a good ASCII chart of well-known user units.

```
    (various           (various         (various
     timers...)         paths...)        sockets...)    (sound devices)
         |                  |                 |               |
         v                  v                 v               v
   timers.target      paths.target     sockets.target    sound.target
         |                  |                 |
         \______________   _|_________________/         (bluetooth devices)
                        \ /                                   |
                         V                                    v
                   basic.target                          bluetooth.target
                         |
              __________/ \_______                      (smartcard devices)
             /                    \                           |
             |                    |                           v
             |                    v                      smartcard.target
             v            graphical-session-pre.target
 (various user services)          |                       (printers)
             |                    v                           |
             |        (services for the graphical sesion)     v
             |                    |                       printer.target
             v                    v
      default.target      graphical-session.target
```

## Final startup scripts 
Following the tree view of systemd, the "branch" of processes that will lead to user interaction is `getty.target` -> `getty@tty1.target` -> `systemd-logind.service`. Other systemd process may be simultaneously executing, but down this branch chain is where you would typically see `/usr/lib/systemd/systemd-logind` executed because of systemd's logind.service. Login managers and display managers for GUI systems will sit on top of this. 

From here, again things are very system specific, but say bash is set as the logins shell: system profiles will be read `/etc/profile` -> `/etc/bashrc`, followed by user specific profiles, `~/.bash_profile` -> `~/.bash_login` -> `~/.profile` -> `~/.bashrc` (potentially only executed if placed in one of the other configs, or when a terminal is launched, as `.bashrc` is for an interactive non-login shell). 

There may be other startup scripts that are placed in various directories, or config files, but they are OS specific. 

## Conclusion 
So that about does it- from power on to startup scripts- the full common Linux boot process. Certainly there is a lot more that could be said here. Most of these areas could be dove into much deeper, but hopefully this severs as a good overview that has the right amount of technical information. I'll probably do specific posts on a lot of these areas in the future and hit some topics like boot / UEFI security, and managing systemd. 