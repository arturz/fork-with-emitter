export default interface RequestResolvers {
    [id: string]: {
        reject: (data?: any) => void;
        resolve: (error?: any) => void;
    };
}
