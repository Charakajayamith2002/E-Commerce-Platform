namespace ECommerce.Application.Common.Models;

public class Result
{
    protected Result(bool succeeded, IEnumerable<string> errors)
    {
        Succeeded = succeeded;
        Errors = errors.ToArray();
    }

    public bool Succeeded { get; }
    public string[] Errors { get; }
    public string? Message { get; set; }

    public static Result Success(string? message = null) =>
        new(true, Array.Empty<string>()) { Message = message };

    public static Result Failure(IEnumerable<string> errors) =>
        new(false, errors);

    public static Result Failure(string error) =>
        new(false, new[] { error });
}

public class Result<T> : Result
{
    protected Result(bool succeeded, T? data, IEnumerable<string> errors)
        : base(succeeded, errors)
    {
        Data = data;
    }

    public T? Data { get; }

    public static Result<T> Success(T data, string? message = null) =>
        new(true, data, Array.Empty<string>()) { Message = message };

    public static new Result<T> Failure(IEnumerable<string> errors) =>
        new(false, default, errors);

    public static new Result<T> Failure(string error) =>
        new(false, default, new[] { error });
}
