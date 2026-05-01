import type { IResponse } from "@/interfaces/IModel.interface";
import type { PostgrestError } from "@supabase/supabase-js";

const createUnknownError = (error: unknown): PostgrestError => ({
  code: "UNKNOWN_ERROR",
  details: "",
  hint: "",
  name: "PostgrestError",
  message: error instanceof Error ? error.message : "Unexpected error",
  toJSON() {
    return {
      code: this.code,
      details: this.details,
      hint: this.hint,
      message: this.message,
      name: this.name,
    };
  },
});

const request = <T>(
  executor: () => PromiseLike<IResponse<T>>,
): Promise<IResponse<T>> =>
  new Promise<IResponse<T>>((resolve, reject) => {
    Promise.resolve(executor())
      .then((result) => {
        const response: IResponse<T> = {
          data: result.data,
          error: result.error,
          status: result.status,
          statusText: result.statusText,
          count:
            (result as IResponse<T> & { count?: number | null }).count ?? null,
        };

        if (result.error) {
          reject(response);
          return;
        }

        resolve(response);
      })
      .catch((error: unknown) => {
        reject({
          data: null,
          error: createUnknownError(error),
          status: 500,
          statusText: "Internal Server Error",
        });
      });
  });

export const ApiService = {
  request,
};
