# Custom Dictionary Usage

The CLI tool supports custom dictionaries for both simplified-to-traditional and traditional-to-simplified conversions using the `-S` and `-T` options respectively.

## Usage

### Simplified to Traditional (-S)
```bash
cc <files> -S "<simplified1><traditional1> <simplified2><traditional2> ..." -t
```

Example:
```bash
# Convert "龙马测试" to "龍馬測試"
cc file.txt -S "龙龍 马馬" -t
```

### Traditional to Simplified (-T)
```bash
cc <files> -T "<traditional1><simplified1> <traditional2><simplified2> ..." -s
```

Example:
```bash
# Convert "龍馬測試" to "龙马测试"
cc file.txt -T "龍龙 馬马" -s
```

## Important Notes

1. **Direction Specification**: You must specify the conversion direction using `-t` (to traditional) or `-s` (to simplified) when using custom dictionaries.

2. **Quoting**: The dictionary string must be quoted to prevent shell interpretation of special characters.

3. **Character Pairs**: Each pair in the dictionary consists of exactly two characters - the source character followed by the target character.

4. **Multiple Pairs**: Multiple character pairs are separated by spaces.

## Examples

### Inline Text Conversion

```bash
# Simplified to Traditional
cc -i "龙马测试" -S "龙龍 马馬" -t
# Output: 龍馬測試

# Traditional to Simplified
cc -i "龍馬測試" -T "龍龙 馬马" -s
# Output: 龙马测试
```

### File Conversion

```bash
# Convert file from simplified to traditional with custom dictionary
cc input.txt -S "龙龍 马馬" -t -o output.txt

# Convert file from traditional to simplified with custom dictionary
cc input.txt -T "龍龙 馬马" -s -o output.txt
```

## Common Use Cases

1. **Regional Variations**: Handle regional character differences that are not covered by the default dictionary.

2. **Specialized Terms**: Convert domain-specific terms that have different representations in simplified and traditional forms.

3. **Personal Preferences**: Customize conversions according to personal or organizational preferences.