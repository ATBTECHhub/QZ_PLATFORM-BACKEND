export const banner = () => `
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://res.cloudinary.com/dkceyr7qe/image/upload/v1729232379/mailbanner_impl0x.png" alt="QzPlatform" style="width: 100%; max-width: 600px;">
    </div>
`;

export const footer = (): string => `
    <div style="text-align: center; margin-top: 20px;">
        <p style="color: #999; font-size: 12px;">QzPlatform &copy; 2024 | All rights reserved</p>
    </div>
`;

export const header =(title: string): string => `
    <h2 style="color: #2d9cdb; text-align: center;">${title}</h2>
`;
