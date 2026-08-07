import subprocess
import sys
import os

def run_command(command, cwd=None, shell=True, wait=True):
    """
    Helper function to run shell commands.
    """
    print(f"\n[EXEC] Running command: {command}")
    try:
        if wait:
            result = subprocess.run(command, cwd=cwd, shell=shell, check=True)
            return result.returncode == 0
        else:
            # Spawn process without blocking
            process = subprocess.Popen(command, cwd=cwd, shell=shell)
            return process
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Command failed: {command}. Details: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] Unexpected error executing: {command}. Details: {e}")
        return False

def main():
    print("=" * 60)
    print("         LINTAS KBB - AUTO STARTUP & SEEDING SCRIPT")
    print("=" * 60)

    project_dir = os.path.dirname(os.path.abspath(__file__))

    # 1. GIT PULL FROM MAIN
    print("\n>>> Phase 1: Pulling latest changes from Git...")
    if not run_command("git pull origin main", cwd=project_dir):
        print("[WARNING] Git pull failed or branch has diverged. Continuing script...")
    else:
        print("[SUCCESS] Git pull completed successfully.")

    # 2. INSTALL DEPENDENCIES (ALL WORKSPACES)
    print("\n>>> Phase 2: Menginstall dependensi (Frontend, Backend, WA-Gateway, dll)...")
    if not run_command("pnpm install", cwd=project_dir):
        print("[ERROR] Failed to install dependencies. Cannot guarantee app will start correctly.")
        choice = input("Do you want to continue anyway? (y/n): ")
        if choice.lower() != 'y':
            sys.exit(1)
            
    # 3. INSTALL PRISMA CLI SECARA GLOBAL
    print("\n>>> Phase 3: Menginstal Prisma CLI...")
    # Menambahkan instalasi global prisma untuk berjaga-jaga jika CLI belum terdaftar di environment
    if not run_command("npm install -g prisma", cwd=project_dir):
        print("[WARNING] Gagal menginstal prisma secara global, mencoba via pnpm...")
        run_command("pnpm install -g prisma", cwd=project_dir)

    # 4. BUILD SHARED PACKAGES
    print("\n>>> Phase 4: Mem-build Shared Packages (@dishub/types)...")
    run_command("pnpm --filter @dishub/types build", cwd=project_dir)

    # 5. GENERATE PRISMA CLIENT & SEED DATABASE
    print("\n>>> Phase 5: Synchronizing Database & Seeding...")
    print("Generating Prisma Client...")
    run_command("pnpm --filter api exec prisma generate", cwd=project_dir)

    print("Pushing Prisma schema changes...")
    run_command("pnpm --filter api exec prisma db push", cwd=project_dir)

    print("Running database seeder...")
    if not run_command("pnpm --filter api exec prisma db seed", cwd=project_dir):
        print("[WARNING] Seeding failed. It may be due to existing duplicate records.")
    else:
        print("[SUCCESS] Database seeded successfully.")

    # 6. RUN DEV SERVER
    print("\n>>> Phase 6: Starting dev servers...")
    print("Launching LINTAS KBB Command Center services...")
    print("Press Ctrl+C to terminate the application.")
    print("-" * 60)

    # Start dev servers using parallel turbo (excluding wa-gateway by default if desired, adjust as needed)
    process = run_command("pnpm turbo run dev --filter=!wa-gateway", cwd=project_dir, wait=False)

    if process:
        try:
            process.wait()
        except KeyboardInterrupt:
            print("\n[INFO] KeyboardInterrupt received. Stopping services...")
            process.terminate()
            print("[INFO] Services stopped. Goodbye!")
    else:
        print("[ERROR] Failed to start the dev server process.")

if __name__ == "__main__":
    main()