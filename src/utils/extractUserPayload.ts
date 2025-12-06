export type UserPayload = {
    id: string;
    name: string;
    iat: number;
    exp: number;
    kind: 'access' | 'refresh';
};

export function extractUserPayload(maybe: unknown): UserPayload | null {
    if (!maybe || typeof maybe !== 'object' || Array.isArray(maybe))
        return null;

    const { id, name, iat, exp, kind } = maybe as Record<string, unknown>;

    const isNum = (v: unknown) => typeof v === 'number' && Number.isFinite(v);
    const isInt = (v: unknown) => isNum(v) && Number.isInteger(v as number);

    if (
        typeof id === 'string' &&
        id.length > 0 &&
        typeof name === 'string' &&
        name.length > 0 &&
        isInt(iat) &&
        isInt(exp) &&
        (exp as number) > (iat as number) &&
        typeof kind === 'string' &&
        (kind === 'access' || kind === 'refresh')
    ) {
        return {
            id,
            name,
            iat: iat as number,
            exp: exp as number,
            kind,
        };
    }

    return null;
}
