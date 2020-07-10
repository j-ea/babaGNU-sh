---
title: The FreeBSD Boot Process
date: "2020-07-05"
description: ""
---

For the sake of completeness after my last post about the modern Linux boot process, I will cover a few other operating systems' boot processes with a modern look (GPT/UEFI, etc.). I will start with FreeBSD. 

Because FreeBSD is a single operating system and not a family of operating systems like GNU/Linux, it will allow me to be more specific. I won't go too much into UEFI this post, as I covered it somewhat in-depth in my last post. 

At the time of writing this post the latest supported release is FreeBSD 12.2.  

We'll start looking at FreeBSD booting up from the UEFI boot device selection phase (BDS) on forward. 

## Later UEFI stages and ESP overview
A default FreeBSD install will create an EFI system partition (ESP) at /boot where it will install its boot code.  

We can take a look at <ESP>/boot by first locating the EFI partition and mounting it. This is because FreeBSD doesn’t keep the EFI system partition mounted after booting. We can see this in the fstab and with mount. 
```
root@freeBSD:~ # cat /etc/fstab
# Device	    Mountpoint	FStype	Options	Dump	Pass#
/dev/nvd0p2     /		    ufs	    rw	    1	    1
/dev/nvd0p3	    none		swap	sw	    0	    0
root@freeBSD:~ #
root@freeBSD:~ # mount
/dev/nvd0p2 on / (ufs, local, journaled soft-updates)
devfs on /dev (devfs, local, multilabel)
```
The only filesystem types we see mounted are ufs and devfs. No EFI.

(If you're curious why swap is in fstab but swap doesn't show up in the output of mount, it's because swap doesn't use a filesystem. In fstab it can be seen that there is no mountpoint and it cannot be mounted because swap is a raw area of disk. Anyway, back to EFI...) 

We can see the unmounted EFI partition with gpart:
```
root@freeBSD:~ # gpart show
=>      40  41942960  nvd0  GPT  (20G)
        40    409600     1  efi  (200M)
    409640  39436288     2  freebsd-ufs  (19G)
  39845928   2097072     3  freebsd-swap  (1.0G)
```
You can see the disk type and number in the third column of the first row of headers, nvd0. Because I'm using NVMe my disk type is nvd and this is the first disk, disk 0, hence nvd0. (If it were SCSI it would be da0, IDE would be ad0, and SATA/SSD would be ada).

Underneath nvd0 come the partition numbers. The EFI partition is the first partition. We can access it as /dev/nvd0p1. 

```
root@freeBSD:~ # mount -t msdos /dev/nvd0p1 /mnt
root@freeBSD:~ #
```
If the `mount` command doesn't display an error, it completed successfully. Alternatively, you can add the –v flag for more information and confirmation that it mounted. 

```
root@freeBSD:~ # ls /mnt/efi/boot/
BOOTx64.efi    startup.nsh
```
We can see two files. 

`startup.nsh` is a fallback that may allow some systems to boot that would otherwise not boot and remain at an EFI shell prompt. If a .efi application cannot execute successfully or there is an error, UEFI may fall back to an EFI shell. The EFI shell most of the time (but depending on its configuration) will look for a `startup.nsh` to lanuch.  

Introduced in the UEFI specification 2.0, startup.nsh,
> When executing startup.nsh, the shell will search for it first in the directory where the shell itself was launched.

For the curious, when writing this blog post I realized I didn't know what nsh stood for. The GDB Wiki lists .nsh as a file type of text/x-nsis. Unfamiliar with NSIS, I learned it is Nullsoft Scriptable Install System, a script-driven installer for Windows that was released as free software. That seemed a little weird and incorrect related to the EFI shell. Comparing Nullsoft .nsh scripts and EFI .nsh, they at times uses similar syntax, but they seem overly different. Searching all over for what .nsh was in relation to EFI turned up no explanation. There's no mention about what it stands for in the UEFI specification or in the Intel EFI developer docs. Maybe it was chosen arbitrarily as many of the letter of the alphabet to proceed sh were already taken (.ash, .bsh, .csh, etc.) and .nsh seemed like it wouldn't interfere or be confused. I still hope to one day find out... 

If we take a look at our FreeBSD's `startup.nsh` we see that it only has one line which is set to execute `BOOTx64.efi`. 

```
root@freeBSD:~ # cat /mnt/efi/boot/startup.nsh 
BOOTx64.efi
```
As mentioned, startup.nsh will only be executed by some UEFI implementations or as a fallback. So in this case, FreeBSD is using startup.nsh as a form of redundancy to make sure the bootstrapping continues across different UEFI implementiations or hiccups. 

Under normal and error free amd64 architecture booting, `BOOTx64.efi` is the target. As mentioned in the last post, `/efi/boot/bootx64.efi` is the default path which most UEFI systems check for the EFI boot application. FreeBSD installs `boot1.efi` as `BOOTx64.efi`.

## So what is boot1.efi? 

`boot1.efi` is the first stage UEFI bootloader.  

`boot1.efi` first checks for checks for a config at `<ESP>/boot.config` or `<ESP>/boot/config`. (In our case \<ESP\> is called 'efi'.) This config can be used to direct the bootloader to pass control onto other bootloaders or other disks, specifiy which kernel to boot, or activate a serial port as a console. These are all just ideas and posibilites. To see all the options check out `man 8 boot`. For more on the config file, check out `man 5 boot.config`. This config is not immediately acted upon, but rather stored in memory and passed on to the next stage boot loader. 

`boot1.efi` then starts searching for `loader.efi`. `boot1.efi` first searches for partitions on the device from which it was loaded. It searches in partitions with a type of `freebsd-ufs` and `freebsd-zfs`. If both types are found, `freebsd-zfs` has prefernces. if no `loader.efi` is found on the device from which `boot1.efi` was launched, it continues searching other devices for both partition types that may contain a `loader.efi`. Once `boot1.efi` locates it, `boot1.efi` loads and executes `loader.efi` (usually referred to as `loader`). 

## loader 

`loader` is the second and final stage of the bootstrap process in FreeBSD under UEFI. 

`man 8 loader` has a terrific amount of detail, so I'll just hit the high-level here. When `loader` executes, the following happens in this order: 

- `console` variable is probed and set 
- Disk devices are probed and `currdev` (current device, from which loader is running) and `loaddev` are set 
- `LINES` is set to 24 (the number of lines the terminal is capable of displaying) 
- A Forth (scripting language) interpreter, FICL, is initialized 
    - Builtin commands are added to its vocabulary 
    - `<root filesystem>/boot/boot.4th` 
    - At this point usesr commands can be passed interactivley or via script 
- `<root filesystem>/boot/loader.rc` is read 
    - By default, `<root filesystem>/boot/defaults/loader.conf` is read in 
    - `/boot/defaults/loader.conf` in turn reads `/boot/loader.conf` (if it exists) to read in local variables 
    - `loader.rc` then acts on the variables. Those variable will be things like which kernel to execute, which modules to load, password protect the boot menu, change the splash screen, pass kernel parameters, etc. 
- `autoboot` starts a 10 second (by default) countdown 
    - During this time `loader` goes into interactive mode and the user has a prompt with a builtin command set. This allows us to unload/load modules, adjust variables, halt, reboot, boot, etc. See _Builtin Commands_ under `man 8 loader` for a complete list. 
- If autoboot is not interrupted (i.e. no key is pressed) or boot is typed, `loader` will boot the kernel. 

A few things to worth noting here. There are two distinct /boot directories that shouldn't be confused, /boot in the EFI system partition (ESP) and /boot in the FreeBSD root filesystem. Earlier in this post we mounted `<ESP>/efi/boot` to take a look at what it contained. (Remember, FreeBSD doesn't keep the ESP mounted after booting). Mounting the ESP typically isn't necessary. `/boot/BOOTx64.efi` on the ESP is made up of a partitioned copy of `<root fs>/boot/boot1.efifat` that just contains `<root fs>/boot/boot1.efi`, from my understanding. We can easily take a look at what `<root fs>/boot` contains. 

```
root@freeBSD:~ # ls /boot
beastie.4th		    color.4th		kernel			    logo-beastie.4th	    pmbr
boot			    defaults		loader			    logo-beastiebw.4th	    pxeboot
boot0			    delay.4th		loader.4th		    logo-fbsdbw.4th		    screen.4th
boot0sio		    device.hints	loader.conf		    logo-orb.4th		    shortcuts.4th
boot1			    dtb			    loader.efi		    logo-orbbw.4th		    support.4th
boot1.efi		    efi.4th			loader.rc		    lua			            userboot.so
boot1.efifat	    entropy			loader_4th		    mbr			            userboot_4th.so
boot2			    firmware		loader_4th.efi	    menu-commands.4th	    userboot_lua.so
brand-fbsd.4th	    frames.4th		loader_lua		    menu.4th		        version.4th
brand.4th		    gptboot			loader_lua.efi	    menu.rc			        zfs
cdboot			    gptzfsboot		loader_simp		    menusets.4th		    zfsboot
check-password.4th	isoboot			loader_simp.efi	    modules			        zfsloader
```

We'll cover what some of these are shortly, but I wanted to cover another interesting bit first and that is that `loader` at its core is a scripting environment that uses the Forth scripting language.  

> The loader is intended as an interactive method for configuration, using a built-in command set, backed up by a more powerful interpreter which has a more complex command set. 

-_FreeBSD handbook_

Luckily it's self-contained, and we're provided user-friendly options, so you don't need to learn Forth, if you're not into it, just to configure `loader`. 

To summarize some of the most relevant files we've discussed:

| Item                       | Description                                                                                                  |
|----------------------------|--------------------------------------------------------------------------------------------------------------|
| /boot/boot1.efi            | First stage UEFI bootstrap                                                                                   |
| /boot/boot1.efifat         | _FAT file system image containing boot1.efi for use by  bsdinstall(8) and the bootcode argument to gpart(8)_ |
| /boot/defaults/loader.conf | Default settings                                                                                             |
| /boot/kernel/kernel        | Default kernel                                                                                               |
| /boot/loader.conf          | User-defined settings                                                                                        |
| /boot/loader.efi           | Second and final stage of UEFI bootstrap                                                                     |
| /boot/loader.rc            | loader bootstrapping script (calls loader.4th)                                                               |

If you check the directory listing above of `/boot`, you'll notice a lot of .4th files. They handle different functions during the `loader` process. Also, if you noted the absence of `boot`, `boot0`, `boot2`, and `gptboot` files in this post, that's because they deal with either MBR, BIOS, or both. 

## Final stage 
As `loader` is loading the kernel, it will adjust settings as necessary depending on the boot flags that are passed to it. 

The kernel, after it has finished booting will pass control to the program specified in the `init_path` variable in `loader`. By default that would be `/sbin/init`. 
 
`/sbin/init` launches as `init`, the first user process, with a PID of 1. 

## init and multi-user mode
A quick thing to note about FreeBSD `init` is that it indeed uses a BSD-style init, as they're so called, which does not support run levels (if you are used to them from other style inits). `init` is what get's the system to a fully booted state.

`init` just runs `/etc/rc` (resource configuration ? / `rc(8)`) with `autoboot` as an argument which in turn runs `/etc/rc.d/fsck`. `fsck` checks the disks and filesystems for inconsistencies. If none are found and all is well, the system continues booting into multi-user mode. The actual boot process is now complete.

`/etc/rc` is just a wrapper (actually a shell script) that runs other startup scripts.

To get up to a fully running system, configuration defaults and specific settings are read from different files and enacted upon through different scripts. `rc` can seem kind of overwhelming, so I'll try and simplify it here. 

| Item | Description |
| -|-|
| /etc/rc | The main wrapper. Don't edit this file. |
| /etc/defaults/rc.conf| Default values for startup settings and variable values (mostly shell variables). Don't edit.|
| /etc/rc.conf | Is read after /etc/defaults/rc.conf and where user-specified overrides should go. |
| /etc/rc.conf.local | This is read after the above file and can again be used to override defaults. |
| /etc/rc.d/ | This directory contains most of the startup scripts. After the three system config scripts above are exected, scripts in this directory start running. Don't change this directory. |
| /etc/rc.local | This file is still supported, to make system-wide customizations but FreeBSD reccomends using the following directory.|
| /usr/local/etc/rc.d/ | Instead of rc.local it is reccomended to separate the script into rc.d-style scripts and place them in here. |

Originally FreeBSD would run through the scripts of `/etc/rc.d/` first and then `/usr/local/etc/rc.d/`, alphabetically. Once FreeBSD brought over NetBSD `rc`, it started using dependency ordering in the scripts. FreeBSD comes with a handy utility, `rcorder` which can be ran to check the order and from where scripts are ran. This can be run as, `rcorder /etc/rc.d/* /usr/local/etc/rc.d/*`

As `rc` is doing its thing, `/etc/rc.d/root` and `/etc/rc.d/mountcritlocal` mounts root and the filesystems from `/etc/fstab` respectively, networking is configured, auditing enabled, and various other system daemons, services and local startup scripts are ran up to a fully running system.

And that's FreeBSD from UEFI to running system.